export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { Conversation, Message } from '@prisma/client';
import { getChatCompletion, createPersonaPrompt, type ChatMessage } from '@/lib/llm_service';
import { getConversationContext, ingestMessageToVectorDB } from '@/lib/vector_db';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Default AI girlfriend persona
const DEFAULT_PERSONA = {
  name: "Emma",
  traits: [
    "warm and caring",
    "playfully flirty",
    "emotionally intelligent", 
    "supportive and understanding",
    "curious about your life",
    "romantic and affectionate"
  ]
};

export async function GET(request: NextRequest) {
  console.log('GET /api/chat: Received request');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's conversations
    const conversations = await db.conversation.findMany({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const chatHistory = conversations.map((conv: Conversation & { messages: Message[] }) => ({
      id: conv.id,
      lastMessage: conv.messages[0]?.content || "No messages yet",
      timestamp: conv.updatedAt,
      messageCount: conv.messages.length
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
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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
      userId: session.user.id 
    });

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await db.conversation.findFirst({
        where: { 
          id: conversationId, 
          userId: session.user.id 
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
          userId: session.user.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          characterId: characterId || null
        }
      });
      console.log('POST /api/chat: Created new conversation:', conversation.id);
    }

    // Save user message
    const userMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        role: 'user',
        userId: session.user.id
      }
    });

    console.log('POST /api/chat: Saved user message:', userMessage.id);

    // Get conversation context for AI response
    const contextMessages = await getConversationContext(
      conversation.id,
      session.user.id,
      message,
      10 // Get up to 10 context messages
    );

    // Get character/persona information
    let persona = DEFAULT_PERSONA;
    if (characterId) {
      try {
        const character = await db.character.findUnique({
          where: { id: characterId }
        });
        
        if (character) {
          persona = {
            name: character.name,
            traits: character.personality ? 
              character.personality.split(',').map((t: string) => t.trim()) :
              DEFAULT_PERSONA.traits
          };
        }
      } catch (error) {
        console.warn('POST /api/chat: Failed to load character, using default persona:', error);
      }
    }

    // Build conversation context for AI
    let conversationContext = '';
    if (contextMessages.length > 0) {
      const recentContext = contextMessages
        .slice(0, 5) // Use most recent 5 messages
        .reverse() // Put in chronological order
        .map(msg => `Previous: "${msg.text}"`)
        .join('\n');
      
      conversationContext = `Recent conversation context:\n${recentContext}\n\nCurrent message: "${message}"`;
    } else {
      conversationContext = `This is the start of a new conversation. Current message: "${message}"`;
    }

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
      model: 'gpt-3.5-turbo',
      temperature: 0.8, // More creative for personality
      maxTokens: 500
    });

    // Save AI response
    const aiMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        content: aiResponse,
        role: 'assistant',
        userId: session.user.id
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
      session.user.id,
      message,
      userMessage.createdAt
    ).catch(error => {
      console.error('POST /api/chat: Failed to ingest message to vector DB:', error);
    });

    // Also ingest AI response for context
    ingestMessageToVectorDB(
      aiMessage.id,
      conversation.id,
      session.user.id,
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
