export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { Conversation, Message } from '@prisma/client';
import { getChatCompletion, createPersonaPrompt, type ChatMessage } from '@/lib/llm_service';
import { getConversationContext, ingestMessageToVectorDB, SemanticSearchResult } from '@/lib/vector_db';
import {
  DEFAULT_PERSONA,
  DEFAULT_LLM_MODEL,
  DEFAULT_LLM_TEMPERATURE,
  DEFAULT_LLM_MAX_TOKENS,
  VECTOR_DB_CONTEXT_MESSAGE_COUNT
} from '@/lib/chatConfig';
import { getPersonaDetails, buildConversationPromptContext, Persona } from '@/lib/chatUtils';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  console.log('GET /api/chat: Received request');
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  try {
    // Get authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('GET /api/chat: Error getting session:', sessionError);
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication error' 
      }, { status: 500 });
    }
    
    if (!session) {
      console.log('GET /api/chat: No authenticated session');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('GET /api/chat: Authenticated user:', userId);

    // Get user's conversations
    const conversations = await db.conversation.findMany({
      where: { userId: userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const chatHistory = conversations.map((conv: Conversation & { messages: Message[], _count: { messages: number } }) => ({
      id: conv.id,
      lastMessage: conv.messages[0]?.content || "No messages yet",
      timestamp: conv.updatedAt,
      messageCount: conv._count.messages
    }));

    console.log('GET /api/chat: Responding with chat history');
    return NextResponse.json({ success: true, data: chatHistory });

  } catch (error) {
    console.error('GET /api/chat: Error -', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch chat history' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/chat: Received request');
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  try {
    // Get authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('POST /api/chat: Error getting session:', sessionError);
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication error' 
      }, { status: 500 });
    }
    
    if (!session) {
      console.log('POST /api/chat: No authenticated session');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('POST /api/chat: Authenticated user:', userId);

    const body = await request.json();
    const { message, conversationId, characterId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Message is required and must be a non-empty string' 
      }, { status: 400 });
    }

    console.log('POST /api/chat: Processing message:', { 
      messageLength: message.length, 
      conversationId, 
      characterId,
      userId: userId 
    });

    // Get or create conversation
    let conversation;
    if (conversationId && conversationId !== 'new-' + conversationId.split('-')[1]) {
      conversation = await db.conversation.findFirst({
        where: { 
          id: conversationId, 
          userId: userId 
        }
      });
      
      if (!conversation) {
        return NextResponse.json({ 
          success: false, 
          error: 'Conversation not found' 
        }, { status: 404 });
      }
    } else {
      // Create new conversation
      conversation = await db.conversation.create({
        data: {
          userId: userId,
          girlfriendId: characterId || null
        }
      });
      console.log('POST /api/chat: Created new conversation:', conversation.id);
    }

    // Save user message
    const userMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        isUserMessage: true
      }
    });

    console.log('POST /api/chat: Saved user message:', userMessage.id);

    // Get conversation context for AI response
    const contextMessages = await getConversationContext(
      conversation.id,
      userId,
      message,
      VECTOR_DB_CONTEXT_MESSAGE_COUNT
    );

    // Get character/persona information
    // If conversation exists, use its girlfriendId, otherwise use characterId from request (for new conv)
    const effectiveCharacterId = conversation?.girlfriendId || characterId;
    const persona: Persona = await getPersonaDetails(effectiveCharacterId);

    // Build conversation context for AI
    const conversationContext = buildConversationPromptContext(contextMessages, message);

    // Create system prompt with persona
    const systemPrompt = createPersonaPrompt(
      persona.name,
      persona.traits,
      conversationContext
    );

    // Prepare messages for AI
    const aiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    // Generate AI response
    console.log('POST /api/chat: Generating AI response...');
    const aiResponse = await getChatCompletion(aiMessages, {
      model: DEFAULT_LLM_MODEL,
      temperature: DEFAULT_LLM_TEMPERATURE,
      maxTokens: DEFAULT_LLM_MAX_TOKENS
    });

    // Save AI response
    const aiMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        content: aiResponse,
        isUserMessage: false
      }
    });

    console.log('POST /api/chat: Saved AI response:', aiMessage.id);

    // Update conversation timestamp
    await db.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    // Ingest user message to vector database for future semantic search
    // Do this asynchronously to not block the response
    ingestMessageToVectorDB(
      userMessage.id,
      conversation.id,
      userId,
      message,
      userMessage.createdAt
    ).catch(error => {
      console.error('POST /api/chat: Failed to ingest message to vector DB:', error);
    });

    // Also ingest AI response for context
    ingestMessageToVectorDB(
      aiMessage.id,
      conversation.id,
      userId,
      aiResponse,
      aiMessage.createdAt
    ).catch(error => {
      console.error('POST /api/chat: Failed to ingest AI response to vector DB:', error);
    });

    console.log('POST /api/chat: Successfully generated intelligent response');
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        reply: aiResponse,
        conversationId: conversation.id,
        messageId: aiMessage.id,
        userMessageId: userMessage.id,
        persona: persona.name
      } 
    });

  } catch (error: any) {
    console.error('POST /api/chat: Error processing message -', error);
    
    // Provide more specific error handling
    if (error.message?.includes('OpenAI')) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI service temporarily unavailable. Please try again.',
        details: 'OpenAI API error'
      }, { status: 503 });
    }
    
    if (error.message?.includes('database') || error.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: 'Database error. Please try again.',
        details: 'Database connection issue'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process message. Please try again.',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
