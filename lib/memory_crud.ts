import { Prisma, UserPreference, ConversationSummary } from '@prisma/client';
import { prisma } from './prisma'; // Use shared Prisma client

// --- UserPreference CRUD ---

/**
 * Retrieves a specific user preference.
 * @param userId The ID of the user.
 * @param key The key of the preference.
 * @returns The UserPreference object or null if not found.
 */
export async function getUserPreference(userId: string, key: string): Promise<UserPreference | null> {
  try {
    return await prisma.userPreference.findUnique({
      where: {
        userId_key: { // This is the default composite key format for Prisma
          userId,
          key,
        },
      },
    });
  } catch (error) {
    console.error(`Error getting user preference for userId ${userId}, key ${key}:`, error);
    throw error; // Or handle more gracefully
  }
}

/**
 * Sets or updates a specific user preference.
 * @param userId The ID of the user.
 * @param key The key of the preference.
 * @param value The value of the preference.
 * @returns The created or updated UserPreference object.
 */
export async function setUserPreference(userId: string, key: string, value: string): Promise<UserPreference> {
  try {
    return await prisma.userPreference.upsert({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
      update: { value },
      create: { userId, key, value },
    });
  } catch (error) {
    console.error(`Error setting user preference for userId ${userId}, key ${key}:`, error);
    throw error;
  }
}

/**
 * Retrieves all preferences for a user.
 * @param userId The ID of the user.
 * @returns An array of UserPreference objects.
 */
export async function getAllUserPreferences(userId: string): Promise<UserPreference[]> {
  try {
    return await prisma.userPreference.findMany({
      where: { userId },
    });
  } catch (error) {
    console.error(`Error getting all user preferences for userId ${userId}:`, error);
    throw error;
  }
}

/**
 * Deletes a specific user preference.
 * @param userId The ID of the user.
 * @param key The key of the preference.
 * @returns The deleted UserPreference object or null if not found/error.
 */
export async function deleteUserPreference(userId: string, key: string): Promise<UserPreference | null> {
  try {
    return await prisma.userPreference.delete({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });
  } catch (error) {
    // Prisma throws P2025 if record to delete is not found.
    if ((error as any).code === 'P2025') {
      console.log(`User preference not found for userId ${userId}, key ${key}. Nothing to delete.`);
      return null;
    }
    console.error(`Error deleting user preference for userId ${userId}, key ${key}:`, error);
    throw error;
  }
}

// --- ConversationSummary CRUD ---

/**
 * Retrieves the summary for a conversation.
 * @param conversationId The ID of the conversation.
 * @returns The ConversationSummary object or null if not found.
 */
export async function getConversationSummary(conversationId: string): Promise<ConversationSummary | null> {
  try {
    return await prisma.conversationSummary.findUnique({
      where: { conversationId },
    });
  } catch (error) {
    console.error(`Error getting conversation summary for conversationId ${conversationId}:`, error);
    throw error;
  }
}

/**
 * Sets or updates the summary for a conversation.
 * @param conversationId The ID of the conversation.
 * @param summary The summary text.
 * @param summarizedAt The timestamp when the summary was generated.
 * @returns The created or updated ConversationSummary object.
 */
export async function setConversationSummary(
  conversationId: string,
  summary: string,
  summarizedAt: Date
): Promise<ConversationSummary> {
  try {
    return await prisma.conversationSummary.upsert({
      where: { conversationId },
      update: { summary, summarizedAt },
      create: { conversationId, summary, summarizedAt },
    });
  } catch (error) {
    console.error(`Error setting conversation summary for conversationId ${conversationId}:`, error);
    throw error;
  }
}

// It might be useful to also have a way to get all summaries or summaries for a user,
// but these are the core ones for now based on the plan.
