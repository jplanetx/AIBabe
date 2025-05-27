export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { Conversation, Message } from '@prisma/client';
import { getChatCompletion, type ChatMessage } from '@/lib/llm_service';
import { getConversationContext, ingestMessageToVectorDB } from '@/lib/vector_db';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  DEFAULT_LLM_MODEL,
  DEFAULT_LLM_TEMPERATURE,
  DEFAULT_LLM_MAX_TOKENS,
  VECTOR_DB_CONTEXT_MESSAGE_COUNT
} from '@/lib/chatConfig';
import { getPersonaDetails, Persona } from '@/lib/chatUtils';
import { 
  SmartPromptBuilder, 
  createDefaultSmartContext,
  type SmartPromptContext,
  type EmotionalState,
  type RelationshipContext,
  type ConversationMemory
} from '@/lib/smartPromptBuilder';

/**
 * Enhanced Chat API with Smart Prompt Builder
 * Integrates vector database, semantic reasoning, and emotional intelligence
 */

export async function GET(request: NextRequest) {
  console.log('GET /api/chat: Received request');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's conversations with enhanced metadata
    const conversations = await db.conversation.findMany({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Get more recent messages for context
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
      messageCount: conv._count.messages,
      recentTopics: extractTopicsFromMessages(conv.messages),
      emotionalTone: analyzeEmotionalTone(conv.messages)
    }));

    console.log('GET /api/chat: Responding with enhanced chat history');
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
  console.log('POST /api/chat: Received smart chat request');
  
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

    console.log('POST /api/chat: Processing smart message:', { 
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
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 20 // Get more messages for better context
          }
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
          girlfriendId: characterId || null
        },
        include: {
          messages: true
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

    // Get semantic context from vector database
    const semanticContext = await getConversationContext(
      conversation.id,
      session.user.id,
      message,
      VECTOR_DB_CONTEXT_MESSAGE_COUNT
    );

    // Get character/persona information
    const effectiveCharacterId = conversation?.girlfriendId || characterId;
    const persona: Persona = await getPersonaDetails(effectiveCharacterId);

    // Build enhanced context for smart prompting
    const smartContext = await buildSmartContext(
      persona,
      message,
      semanticContext,
      conversation,
      session.user.id
    );

    // Generate smart prompt using the enhanced prompt builder
    const smartPrompt = SmartPromptBuilder.buildSmartPrompt(smartContext);

    console.log('POST /api/chat: Generated smart prompt (length:', smartPrompt.length, ')');

    // Prepare messages for AI with smart prompting
    const aiMessages: ChatMessage[] = [
      { role: 'system', content: smartPrompt },
      { role: 'user', content: message }
    ];

    // Generate AI response with enhanced context
    console.log('POST /api/chat: Generating intelligent AI response...');
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

    console.log('POST /api/chat: Saved intelligent AI response:', aiMessage.id);

    // Update conversation timestamp
    await db.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    // Ingest messages to vector database for future semantic search
    // Do this asynchronously to not block the response
    Promise.all([
      ingestMessageToVectorDB(
        userMessage.id,
        conversation.id,
        session.user.id,
        message,
        userMessage.createdAt
      ),
      ingestMessageToVectorDB(
        aiMessage.id,
        conversation.id,
        session.user.id,
        aiResponse,
        aiMessage.createdAt
      )
    ]).catch(error => {
      console.error('POST /api/chat: Failed to ingest messages to vector DB:', error);
    });

    console.log('POST /api/chat: Successfully generated intelligent response with semantic reasoning');
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        reply: aiResponse,
        conversationId: conversation.id,
        messageId: aiMessage.id,
        userMessageId: userMessage.id,
        persona: persona.name,
        intelligence: {
          semanticContextUsed: semanticContext.length > 0,
          emotionalState: smartContext.emotionalState.mood,
          relationshipStage: smartContext.relationshipContext.stage,
          memoryIntegration: smartContext.conversationMemory.recentTopics.length > 0
        }
      } 
    });

  } catch (error: any) {
    console.error('POST /api/chat: Error processing smart message -', error);
    
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

/**
 * Build comprehensive smart context for enhanced prompting
 */
async function buildSmartContext(
  persona: Persona,
  currentMessage: string,
  semanticContext: any[],
  conversation: any,
  userId: string
): Promise<SmartPromptContext> {
  
  // Analyze conversation history for relationship context
  const relationshipContext = analyzeRelationshipContext(conversation.messages);
  
  // Analyze emotional state from recent messages
  const emotionalState = analyzeEmotionalState(conversation.messages, currentMessage);
  
  // Build conversation memory from message history
  const conversationMemory = buildConversationMemory(conversation.messages);
  
  // Determine time of day for contextual awareness
  const timeOfDay = getTimeOfDay();
  
  // Analyze user mood from current message
  const userMood = analyzeUserMood(currentMessage);

  return {
    persona,
    currentMessage,
    semanticContext,
    emotionalState,
    relationshipContext,
    conversationMemory,
    timeOfDay,
    userMood
  };
}

/**
 * Analyze relationship context from conversation history
 */
function analyzeRelationshipContext(messages: Message[]): RelationshipContext {
  const messageCount = messages.length;
  const intimacyIndicators = messages.filter(m => 
    m.content.toLowerCase().includes('love') || 
    m.content.toLowerCase().includes('miss') ||
    m.content.toLowerCase().includes('care')
  ).length;

  // Determine relationship stage based on message count and intimacy
  let stage: RelationshipContext['stage'] = 'new';
  let intimacyLevel = 3;

  if (messageCount > 100) {
    stage = 'long_term';
    intimacyLevel = 8;
  } else if (messageCount > 50) {
    stage = 'intimate';
    intimacyLevel = 7;
  } else if (messageCount > 20) {
    stage = 'comfortable';
    intimacyLevel = 5;
  } else if (messageCount > 5) {
    stage = 'getting_to_know';
    intimacyLevel = 4;
  }

  // Adjust intimacy based on emotional indicators
  intimacyLevel = Math.min(10, intimacyLevel + Math.floor(intimacyIndicators / 3));

  return {
    stage,
    intimacyLevel,
    sharedExperiences: extractSharedExperiences(messages),
    userPreferences: extractUserPreferences(messages),
    conversationStyle: determineConversationStyle(messages)
  };
}

/**
 * Analyze emotional state from conversation context
 */
function analyzeEmotionalState(messages: Message[], currentMessage: string): EmotionalState {
  const recentMessages = messages.slice(0, 5);
  const allText = recentMessages.map(m => m.content).join(' ') + ' ' + currentMessage;
  const lowerText = allText.toLowerCase();

  // Simple emotion detection based on keywords
  if (lowerText.includes('happy') || lowerText.includes('excited') || lowerText.includes('great')) {
    return { mood: 'happy', intensity: 7, context: 'Positive conversation tone' };
  }
  
  if (lowerText.includes('sad') || lowerText.includes('upset') || lowerText.includes('down')) {
    return { mood: 'sad', intensity: 6, context: 'User expressing sadness' };
  }
  
  if (lowerText.includes('love') || lowerText.includes('romantic') || lowerText.includes('kiss')) {
    return { mood: 'romantic', intensity: 8, context: 'Romantic conversation' };
  }
  
  if (lowerText.includes('fun') || lowerText.includes('laugh') || lowerText.includes('joke')) {
    return { mood: 'playful', intensity: 6, context: 'Playful interaction' };
  }

  return { mood: 'neutral', intensity: 5, context: 'General conversation' };
}

/**
 * Build conversation memory from message history
 */
function buildConversationMemory(messages: Message[]): ConversationMemory {
  const recentTopics = extractTopicsFromMessages(messages.slice(0, 10));
  const emotionalMoments = extractEmotionalMoments(messages);
  const userPersonality = analyzeUserPersonality(messages);

  return {
    recentTopics,
    emotionalMoments,
    userPersonality
  };
}

/**
 * Extract topics from messages using simple keyword analysis
 */
function extractTopicsFromMessages(messages: Message[]): string[] {
  const topics = new Set<string>();
  const topicKeywords = {
    'work': ['work', 'job', 'boss', 'office', 'meeting'],
    'family': ['family', 'mom', 'dad', 'sister', 'brother'],
    'hobbies': ['hobby', 'music', 'movie', 'book', 'game'],
    'feelings': ['feel', 'emotion', 'happy', 'sad', 'excited'],
    'future': ['future', 'plan', 'dream', 'goal', 'hope']
  };

  messages.forEach(message => {
    const content = message.content.toLowerCase();
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        topics.add(topic);
      }
    });
  });

  return Array.from(topics);
}

/**
 * Analyze emotional tone of messages
 */
function analyzeEmotionalTone(messages: Message[]): string {
  if (messages.length === 0) return 'neutral';
  
  const recentContent = messages.slice(0, 3).map(m => m.content).join(' ').toLowerCase();
  
  if (recentContent.includes('happy') || recentContent.includes('great')) return 'positive';
  if (recentContent.includes('sad') || recentContent.includes('upset')) return 'negative';
  if (recentContent.includes('love') || recentContent.includes('miss')) return 'romantic';
  
  return 'neutral';
}

/**
 * Extract shared experiences from conversation
 */
function extractSharedExperiences(messages: Message[]): string[] {
  const experiences: string[] = [];
  // Simple implementation - could be enhanced with NLP
  messages.forEach(message => {
    const content = message.content.toLowerCase();
    if (content.includes('remember when') || content.includes('that time')) {
      experiences.push(message.content.substring(0, 50) + '...');
    }
  });
  return experiences.slice(0, 5); // Limit to 5 most recent
}

/**
 * Extract user preferences from conversation
 */
function extractUserPreferences(messages: Message[]): string[] {
  const preferences: string[] = [];
  // Simple implementation - could be enhanced
  messages.forEach(message => {
    const content = message.content.toLowerCase();
    if (content.includes('i like') || content.includes('i love') || content.includes('i prefer')) {
      preferences.push(message.content.substring(0, 50) + '...');
    }
  });
  return preferences.slice(0, 5);
}

/**
 * Determine conversation style from message patterns
 */
function determineConversationStyle(messages: Message[]): RelationshipContext['conversationStyle'] {
  if (messages.length < 3) return 'casual';
  
  const content = messages.slice(0, 10).map(m => m.content).join(' ').toLowerCase();
  
  if (content.includes('feel') && content.includes('think')) return 'deep';
  if (content.includes('love') || content.includes('romantic')) return 'flirty';
  if (content.includes('support') || content.includes('help')) return 'supportive';
  
  return 'casual';
}

/**
 * Extract emotional moments from conversation
 */
function extractEmotionalMoments(messages: Message[]): ConversationMemory['emotionalMoments'] {
  const moments: ConversationMemory['emotionalMoments'] = [];
  
  messages.forEach(message => {
    const content = message.content.toLowerCase();
    let emotion = '';
    let significance = 1;
    
    if (content.includes('love')) { emotion = 'love'; significance = 9; }
    else if (content.includes('happy')) { emotion = 'happiness'; significance = 7; }
    else if (content.includes('sad')) { emotion = 'sadness'; significance = 8; }
    else if (content.includes('excited')) { emotion = 'excitement'; significance = 6; }
    
    if (emotion) {
      moments.push({
        topic: message.content.substring(0, 30) + '...',
        emotion,
        significance
      });
    }
  });
  
  return moments.slice(0, 5); // Keep top 5 emotional moments
}

/**
 * Analyze user personality from messages
 */
function analyzeUserPersonality(messages: Message[]): ConversationMemory['userPersonality'] {
  const userMessages = messages.filter(m => m.isUserMessage);
  const content = userMessages.map(m => m.content).join(' ').toLowerCase();
  
  const traits: string[] = [];
  const interests: string[] = [];
  
  // Simple trait detection
  if (content.includes('funny') || content.includes('laugh')) traits.push('humorous');
  if (content.includes('work') || content.includes('busy')) traits.push('hardworking');
  if (content.includes('family') || content.includes('friend')) traits.push('social');
  
  // Simple interest detection
  if (content.includes('music')) interests.push('music');
  if (content.includes('movie') || content.includes('film')) interests.push('movies');
  if (content.includes('book') || content.includes('read')) interests.push('reading');
  if (content.includes('game') || content.includes('play')) interests.push('gaming');
  
  const communicationStyle = content.length > 500 ? 'detailed' : 'concise';
  
  return {
    traits,
    interests,
    communicationStyle
  };
}

/**
 * Get current time of day for contextual awareness
 */
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  
  if (hour < 6) return 'late night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

/**
 * Analyze user mood from current message
 */
function analyzeUserMood(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) return 'tired';
  if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) return 'stressed';
  if (lowerMessage.includes('happy') || lowerMessage.includes('great')) return 'happy';
  if (lowerMessage.includes('sad') || lowerMessage.includes('down')) return 'sad';
  if (lowerMessage.includes('excited') || lowerMessage.includes('amazing')) return 'excited';
  
  return 'neutral';
}
