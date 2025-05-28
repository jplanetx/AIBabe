import { PrismaClient, Message } from "@prisma/client";
import { db } from "@/lib/db";
import { DEFAULT_PERSONA, LLM_CONTEXT_MESSAGE_COUNT } from '@/lib/chatConfig';
import { SemanticSearchResult } from '@/lib/vector_db';

export interface Persona {
  id: string | null;
  name: string;
  traits: string[];
}

/**
 * Fetches character details and constructs a persona object.
 * Falls back to DEFAULT_PERSONA if characterId is not provided or character is not found.
 * @param characterId - The ID of the character to fetch.
 * @returns The persona object.
 */
export async function getPersonaDetails(characterId?: string): Promise<Persona> {
  if (!characterId) {
    return DEFAULT_PERSONA;
  }
  try {
    const girlfriend = await db.girlfriend.findUnique({
      where: { id: characterId }
    });
    
    if (girlfriend) {
      return {
        id: girlfriend.id,
        name: girlfriend.name,
        traits: girlfriend.personality ? 
          girlfriend.personality.split(',').map((t: string) => t.trim()) :
          DEFAULT_PERSONA.traits
      };
    }
  } catch (error) {
    console.warn(`Failed to load girlfriend ${characterId}, using default persona:`, error);
  }
  return DEFAULT_PERSONA;
}

/**
 * Builds the conversation context string for the LLM prompt.
 * @param contextMessages - Array of messages retrieved from vector DB.
 * @param currentUserMessage - The current message from the user.
 * @returns A string representing the conversation context.
 */
export function buildConversationPromptContext(
  contextMessages: SemanticSearchResult[],
  currentUserMessage: string
): string {
  if (contextMessages.length > 0) {
    const recentContext = contextMessages
      .slice(0, LLM_CONTEXT_MESSAGE_COUNT) // Use configured number of recent messages
      .reverse() // Put in chronological order
      .map(msg => `Previous: "${msg.text}"`) // Ensure msg.text is the correct field
      .join('\n');
    
    return `Recent conversation context:\n${recentContext}\n\nCurrent message: "${currentUserMessage}"`;
  } else {
    return `This is the start of a new conversation. Current message: "${currentUserMessage}"`;
  }
}

/**
 * Analyzes the sentiment of a user message.
 * Placeholder implementation.
 * @param userMessage - The user's message string.
 * @returns A promise that resolves to a sentiment string ('positive', 'negative', 'neutral').
 */
export async function analyzeSentiment(userMessage: string): Promise<'positive' | 'negative' | 'neutral'> {
  console.log(`Analyzing sentiment for: "${userMessage}"`);
  // Placeholder: In a real implementation, this would call a sentiment analysis service.
  if (userMessage.toLowerCase().includes('sad') || userMessage.toLowerCase().includes('angry')) {
    return 'negative';
  }
  if (userMessage.toLowerCase().includes('happy') || userMessage.toLowerCase().includes('great')) {
    return 'positive';
  }
  return 'neutral';
}

/**
 * Retrieves relevant memory items for the conversation.
 * Placeholder implementation.
 * @param userId - The ID of the user.
 * @param conversationId - The ID of the current conversation (can be null for new conversations).
 * @param userMessage - The current user's message.
 * @returns A promise that resolves to an array of relevant memory strings.
 */
export async function getRelevantMemory(
  userId: string,
  conversationId: string | null,
  userMessage: string
): Promise<string[]> {
  console.log(`Getting relevant memory for user ${userId}, conversation ${conversationId}, message: "${userMessage}"`);
  // Placeholder: In a real implementation, this would query a vector DB or other memory store.
  // This might adapt or call getConversationContext from '@/lib/vector_db.ts'
  return [`Memory: User ${userId} previously talked about topic X related to "${userMessage.substring(0,10)}..."`];
}

/**
 * Saves a message to the Prisma database.
 * @param userId - The ID of the user associated with the message (for context, not a direct field on Message).
 * @param conversationId - The ID of the conversation.
 * @param content - The content of the message.
 * @param isUserMessage - Boolean indicating if the message is from the user or the assistant.
 * @param prisma - The Prisma client instance.
 * @returns A promise that resolves to the created message.
 */
export async function saveMessage(
  userId: string, // userId is for context/logging, not directly on Message model for sender
  conversationId: string,
  content: string,
  isUserMessage: boolean,
  prisma: PrismaClient // Pass PrismaClient instance
): Promise<Message> {
  console.log(`Saving message for conversation ${conversationId}, user: ${userId}, isUser: ${isUserMessage}`);
  const message = await prisma.message.create({
    data: {
      conversationId: conversationId,
      content: content,
      isUserMessage: isUserMessage,
      // Note: Prisma schema for Message does not have a direct userId field for sender.
      // It's linked via Conversation.userId.
    },
  });
  return message;
}
