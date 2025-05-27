import { db } from "@/lib/db";
import { DEFAULT_PERSONA, LLM_CONTEXT_MESSAGE_COUNT } from '@/lib/chatConfig';
import { SemanticSearchResult } from '@/lib/vector_db';

export interface Persona {
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
    const character = await db.character.findUnique({
      where: { id: characterId }
    });
    
    if (character) {
      return {
        name: character.name,
        traits: character.personality ? 
          character.personality.split(',').map((t: string) => t.trim()) :
          DEFAULT_PERSONA.traits
      };
    }
  } catch (error) {
    console.warn(`Failed to load character ${characterId}, using default persona:`, error);
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