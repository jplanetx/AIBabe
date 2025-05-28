export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { db } from "@/lib/db";
import { Conversation, Message, PrismaClient } from '@prisma/client';
import { getChatCompletion, createPersonaPrompt, type ChatMessage } from '@/lib/llm_service';
import { ingestMessageToVectorDB } from '@/lib/vector_db';
import {
  DEFAULT_PERSONA,
  DEFAULT_LLM_MODEL,
  DEFAULT_LLM_TEMPERATURE,
  DEFAULT_LLM_MAX_TOKENS,
} from '@/lib/chatConfig';
import { 
  getPersonaDetails, 
  Persona,
  analyzeSentiment,
  getRelevantMemory,
  saveMessage
} from '@/lib/chatUtils';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


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
  
  const streaming = request.nextUrl.searchParams.get('stream') === 'true';
  console.log('POST /api/chat: Streaming mode:', streaming);

  const res = NextResponse.next({ // Renamed to avoid conflict with 'response' variable name if used later
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
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // 1. Authentication & Authorization
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('POST /api/chat: Error getting session:', sessionError.message);
    return NextResponse.json({ success: false, error: 'Authentication error', details: sessionError.message }, { status: 500 });
  }
  
  if (!session) {
    console.log('POST /api/chat: No authenticated session');
    return NextResponse.json({ success: false, error: 'Unauthorized - Please log in' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log('POST /api/chat: Authenticated user:', userId);

  try {
    const body = await request.json();
    const { message: userMessageContent, conversationId: currentConversationId, characterId } = body;

    if (!userMessageContent || typeof userMessageContent !== 'string' || userMessageContent.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Message is required and must be a non-empty string' }, { status: 400 });
    }

    console.log('POST /api/chat: Processing message:', { 
      messageLength: userMessageContent.length, 
      conversationId: currentConversationId, 
      characterId,
      userId
    });

    let conversation: Conversation;
    let isNewConversation = false;

    if (currentConversationId && currentConversationId !== 'new-' + (currentConversationId.split('-')[1] || characterId)) {
      const existingConversation = await db.conversation.findFirst({
        where: { id: currentConversationId, userId: userId }
      });
      if (!existingConversation) {
        return NextResponse.json({ success: false, error: 'Conversation not found or access denied' }, { status: 404 });
      }
      conversation = existingConversation;
    } else {
      isNewConversation = true;
      const personaForNewConv = await getPersonaDetails(characterId);
      conversation = await db.conversation.create({
        data: {
          userId: userId, // Scalar foreign key
          // user: { connect: { id: userId } }, // Prisma infers this from userId if schema is set up correctly
          girlfriendId: personaForNewConv.id 
        }
      });
      console.log('POST /api/chat: Created new conversation:', conversation.id, 'with girlfriendId:', personaForNewConv.id);
    }
    
    const finalConversationId = conversation.id;

    const savedUserMessage = await saveMessage(userId, finalConversationId, userMessageContent, true, db);
    console.log('POST /api/chat: Saved user message:', savedUserMessage.id);

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let relevantMemoryItems: string[] = [];

    try {
      const [sentimentResult, memoryResult] = await Promise.all([
        analyzeSentiment(userMessageContent),
        getRelevantMemory(userId, finalConversationId, userMessageContent) // Using finalConversationId
      ]);
      sentiment = sentimentResult;
      relevantMemoryItems = memoryResult;
      console.log('POST /api/chat: Parallel fetch results - Sentiment:', sentiment, 'Memory items:', relevantMemoryItems.length);
    } catch (fetchError: any) {
        console.warn('POST /api/chat: Error in parallel data fetching, using defaults:', fetchError.message);
    }
    
    const persona = await getPersonaDetails(conversation.girlfriendId || characterId);
    let systemPromptContent = `You are ${persona.name}. Traits: ${persona.traits.join(', ')}.`;
    if (sentiment === 'negative') {
      systemPromptContent += " Remember to be extra understanding and empathetic.";
    }
    console.log('POST /api/chat: Constructed system prompt for persona:', persona.name);

    const messagesForLLM: ChatMessage[] = [{ role: 'system', content: systemPromptContent }];
    relevantMemoryItems.forEach(mem => messagesForLLM.push({ role: 'system', content: mem }));
    messagesForLLM.push({ role: 'user', content: userMessageContent });

    if (streaming) {
      console.log('POST /api/chat: Starting stream for AI response...');
      const llmStream = await openai.chat.completions.create({
        model: DEFAULT_LLM_MODEL,
        messages: messagesForLLM as any, 
        temperature: DEFAULT_LLM_TEMPERATURE,
        max_tokens: DEFAULT_LLM_MAX_TOKENS,
        stream: true,
      });

      const vercelAIStream = OpenAIStream(llmStream, {
        async onCompletion(completion: string) { // Added type for completion
          if (completion.trim().length > 0) {
            try {
              const savedAIMessage = await saveMessage(userId, finalConversationId, completion, false, db);
              console.log('POST /api/chat (stream onCompletion): Saved AI response:', savedAIMessage.id);
              await db.conversation.update({
                where: { id: finalConversationId },
                data: { updatedAt: new Date() }
              });
              console.log('POST /api/chat (stream onCompletion): Updated conversation timestamp.');
              // Asynchronously ingest messages to vector DB
              ingestMessageToVectorDB(savedUserMessage.id, finalConversationId, userId, userMessageContent, savedUserMessage.createdAt).catch(e => console.error('VecDB user ingest error (stream):', e.message));
              ingestMessageToVectorDB(savedAIMessage.id, finalConversationId, userId, completion, savedAIMessage.createdAt).catch(e => console.error('VecDB AI ingest error (stream):', e.message));
            } catch (dbError: any) {
              console.error('POST /api/chat (stream onCompletion): Error in DB operations:', dbError.message);
            }
          }
        }
      });
      return new StreamingTextResponse(vercelAIStream);

    } else {
      console.log('POST /api/chat: Generating non-streaming AI response...');
      const aiResponseContent = await getChatCompletion(messagesForLLM, {
        model: DEFAULT_LLM_MODEL,
        temperature: DEFAULT_LLM_TEMPERATURE,
        maxTokens: DEFAULT_LLM_MAX_TOKENS
      });

      if (!aiResponseContent) {
        console.error('POST /api/chat: AI response content is null or empty.');
        return NextResponse.json({ success: false, error: 'AI service failed to generate a response.' }, { status: 502 });
      }

      const savedAIMessage = await saveMessage(userId, finalConversationId, aiResponseContent, false, db);
      console.log('POST /api/chat: Saved AI response:', savedAIMessage.id);

      await db.conversation.update({
        where: { id: finalConversationId },
        data: { updatedAt: new Date() }
      });
      console.log('POST /api/chat: Updated conversation timestamp.');

      ingestMessageToVectorDB(savedUserMessage.id, finalConversationId, userId, userMessageContent, savedUserMessage.createdAt)
        .catch(error => console.error('POST /api/chat: Failed to ingest user message to vector DB:', error.message));
      ingestMessageToVectorDB(savedAIMessage.id, finalConversationId, userId, aiResponseContent, savedAIMessage.createdAt)
        .catch(error => console.error('POST /api/chat: Failed to ingest AI response to vector DB:', error.message));
      
      console.log('POST /api/chat: Successfully generated intelligent response (non-streaming)');
      return NextResponse.json({ 
        success: true, 
        data: { 
          reply: aiResponseContent,
          conversationId: finalConversationId,
          messageId: savedAIMessage.id,
          userMessageId: savedUserMessage.id,
          personaUsed: persona.name,
          isNewConversation
        } 
      });
    }

  } catch (error: any) {
    console.error('POST /api/chat: Unhandled error processing message -', error.message, error.stack);
    
    let status = 500;
    let errorMessage = 'Failed to process message. Please try again.';
    let errorDetails = error.message || 'Unknown error';

    if (error.message?.includes('OpenAI') || error.message?.includes('LLM')) {
      status = 502;
      errorMessage = 'AI service temporarily unavailable. Please try again.';
      errorDetails = 'LLM API error: ' + error.message;
    } else if (error.message?.includes('database') || error.code?.startsWith('P')) {
      status = 500; 
      errorMessage = 'Database error. Please try again.';
      errorDetails = 'Database operation failed: ' + error.message;
    } else if (error.name === 'TypeError' && error.message.includes("expected 'string'")) {
        status = 400;
        errorMessage = "Invalid data format in request.";
        errorDetails = error.message;
    }

    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: errorDetails
    }, { status });
  }
}
