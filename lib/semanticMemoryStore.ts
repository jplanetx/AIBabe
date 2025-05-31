import { Pinecone, Index as PineconeIndex } from "@pinecone-database/pinecone";
import { PrismaClient, UserFact, UserSemanticPreference, SemanticPreferenceType } from "@prisma/client";
import { getPineconeClient } from "./pineconeClient";
import { getEmbedding } from "./llm_service"; // Corrected import path
import { prisma } from "./prismaClient"; // Using the exported prisma instance

const pinecone: Pinecone = getPineconeClient();

const pineconeSemanticNamespace = process.env.PINECONE_SEMANTIC_NAMESPACE || "semantic-memories";

/**
 * Retrieves the Pinecone index, handling potential errors.
 * @returns {PineconeIndex | null} The Pinecone index object or null if an error occurs.
 */
function getPineconeIndex(): PineconeIndex | null {
  const indexName = process.env.PINECONE_INDEX_NAME;
  if (!indexName) {
    console.error("[SemanticMemoryStore] Error: PINECONE_INDEX_NAME environment variable is not set.");
    return null;
  }
  try {
    return pinecone.Index(indexName);
  } catch (error) {
    console.error("[SemanticMemoryStore] Error initializing Pinecone index:", error);
    return null;
  }
}

/**
 * Checks the connection to Pinecone and Supabase (Prisma).
 * @returns {Promise<{ pinecone: boolean; supabase: boolean }>} An object indicating connection status.
 */
async function checkConnections(): Promise<{ pinecone: boolean; supabase: boolean }> {
  let pineconeConnected = false;
  let supabaseConnected = false;

  const index = getPineconeIndex();
  if (index) {
    try {
      await index.describeIndexStats();
      console.log("[SemanticMemoryStore] Pinecone connection successful!");
      pineconeConnected = true;
    } catch (error) {
      console.error("[SemanticMemoryStore] Pinecone connection failed:", error);
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    try {
      await prisma.$connect();
      console.log("[SemanticMemoryStore] Supabase connection successful!");
      supabaseConnected = true;
      await prisma.$disconnect(); // Disconnect after check
    } catch (error) {
      console.error("[SemanticMemoryStore] Supabase connection failed:", error);
    }
  } else {
    supabaseConnected = true; // Mock Supabase connection in test environment
  }

  return { pinecone: pineconeConnected, supabase: supabaseConnected };
}

/**
 * Creates a new fact memory, storing it in Supabase and Pinecone.
 * @param {string} userId - The ID of the user.
 * @param {string} factText - The text of the fact.
 * @param {string} [sourceSessionId] - Optional ID of the session where the fact originated.
 * @returns {Promise<UserFact | null>} The created UserFact object or null on failure.
 */
async function createFactMemory(userId: string, factText: string, sourceSessionId?: string): Promise<UserFact | null> {
  try {
    const embedding = await getEmbedding(factText);
    if (!embedding) {
      console.error("[SemanticMemoryStore] Error in createFactMemory: Failed to generate embedding.");
      return null;
    }

    const newFact = await prisma.userFact.create({
      data: {
        userId,
        factText,
        sourceSessionId,
      },
    });

    const pineconeIndex = getPineconeIndex();
    if (pineconeIndex) {
      const pineconeMetadata = {
        vectorId: newFact.id,
        userId,
        factText,
        sourceSessionId: sourceSessionId || "",
        createdAt: newFact.createdAt.toISOString(),
        updatedAt: newFact.updatedAt.toISOString(),
        type: 'fact',
      };

      await pineconeIndex.namespace(pineconeSemanticNamespace).upsert([
        {
          id: newFact.id,
          values: embedding,
          metadata: pineconeMetadata,
        },
      ]);
    } else {
        console.warn("[SemanticMemoryStore] createFactMemory: Pinecone index not available, skipping Pinecone upsert.");
    }
    return newFact;
  } catch (error) {
    console.error("[SemanticMemoryStore] Error in createFactMemory:", error);
    return null;
  }
}

/**
 * Creates or updates a user's semantic preference, storing it in Supabase and Pinecone.
 * @param {string} userId - The ID of the user.
 * @param {SemanticPreferenceType} preferenceType - The type of the preference.
 * @param {string} preferenceValue - The value of the preference.
 * @param {string} [sourceSessionId] - Optional ID of the session where the preference originated.
 * @returns {Promise<UserSemanticPreference | null>} The created/updated UserSemanticPreference object or null on failure.
 */
async function createPreferenceMemory(
  userId: string,
  preferenceType: SemanticPreferenceType,
  preferenceValue: string,
  sourceSessionId?: string
): Promise<UserSemanticPreference | null> {
  try {
    const embedding = await getEmbedding(preferenceValue);
    if (!embedding) {
      console.error("[SemanticMemoryStore] Error in createPreferenceMemory: Failed to generate embedding.");
      return null;
    }

    const pref = await prisma.userSemanticPreference.upsert({
      where: {
        userId_preferenceType: {
          userId,
          preferenceType,
        },
      },
      update: {
        preferenceValue,
        sourceSessionId,
      },
      create: {
        userId,
        preferenceType,
        preferenceValue,
        sourceSessionId,
      },
    });

    const pineconeIndex = getPineconeIndex();
    if (pineconeIndex) {
      const pineconeMetadata = {
        vectorId: pref.id,
        userId,
        preferenceType: pref.preferenceType.toString(),
        preferenceValue,
        sourceSessionId: sourceSessionId || "",
        createdAt: pref.createdAt.toISOString(),
        updatedAt: pref.updatedAt.toISOString(),
        type: 'preference',
      };

      await pineconeIndex.namespace(pineconeSemanticNamespace).upsert([
        {
          id: pref.id,
          values: embedding,
          metadata: pineconeMetadata,
        },
      ]);
    } else {
        console.warn("[SemanticMemoryStore] createPreferenceMemory: Pinecone index not available, skipping Pinecone upsert.");
    }
    return pref;
  } catch (error) {
    console.error("[SemanticMemoryStore] Error in createPreferenceMemory:", error);
    return null;
  }
}

/**
 * Retrieves all fact memories for a given user ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<UserFact[]>} An array of UserFact objects, or an empty array if none are found or on error.
 */
async function getFactsByUserId(userId: string): Promise<UserFact[]> {
  try {
    const facts = await prisma.userFact.findMany({
      where: { userId },
    });
    return facts;
  } catch (error) {
    console.error("[SemanticMemoryStore] Error in getFactsByUserId:", error);
    return [];
  }
}

/**
 * Retrieves a specific semantic preference for a user.
 * @param {string} userId - The ID of the user.
 * @param {SemanticPreferenceType} preferenceType - The type of the preference.
 * @returns {Promise<UserSemanticPreference | null>} The UserSemanticPreference object or null if not found or on error.
 */
async function getPreference(
  userId: string,
  preferenceType: SemanticPreferenceType
): Promise<UserSemanticPreference | null> {
  try {
    const preference = await prisma.userSemanticPreference.findUnique({
      where: {
        userId_preferenceType: {
          userId,
          preferenceType,
        },
      },
    });
    return preference;
  } catch (error) {
    console.error("[SemanticMemoryStore] Error in getPreference:", error);
    return null;
  }
}

/**
 * Updates the text of an existing fact memory and its embedding in Pinecone.
 * @param {string} factId - The ID of the fact to update.
 * @param {string} newFactText - The new text for the fact.
 * @returns {Promise<UserFact | null>} The updated UserFact object or null on failure.
 */
async function updateFactMemoryText(factId: string, newFactText: string): Promise<UserFact | null> {
  try {
    let updatedFact = await prisma.userFact.update({
      where: { id: factId },
      data: {
        factText: newFactText,
        updatedAt: new Date(), // Explicitly set updatedAt
      },
    });

    if (!updatedFact) {
      console.error(`[SemanticMemoryStore] Error in updateFactMemoryText: Fact with ID ${factId} not found.`);
      return null;
    }
    
    // Re-fetch to ensure all fields are current, especially if triggers or defaults modified it.
    // However, Prisma update returns the updated record, so this might be redundant unless specific DB-side changes are expected.
    // For simplicity, we'll use the returned 'updatedFact'. If issues arise, re-fetch:
    // updatedFact = await prisma.userFact.findUnique({ where: { id: factId } });
    // if (!updatedFact) return null;


    const newEmbedding = await getEmbedding(newFactText);
    if (!newEmbedding) {
      console.error("[SemanticMemoryStore] Error in updateFactMemoryText: Failed to generate new embedding.");
      // Supabase record is updated, but Pinecone won't be. Consider logging this state.
      return updatedFact; // Or null if strict consistency is required
    }

    const pineconeIndex = getPineconeIndex();
    if (pineconeIndex) {
      const pineconeMetadata = {
        vectorId: updatedFact.id,
        userId: updatedFact.userId,
        factText: updatedFact.factText,
        sourceSessionId: updatedFact.sourceSessionId || "",
        createdAt: updatedFact.createdAt.toISOString(),
        updatedAt: updatedFact.updatedAt.toISOString(),
        type: 'fact',
      };

      await pineconeIndex.namespace(pineconeSemanticNamespace).upsert([
        {
          id: factId,
          values: newEmbedding,
          metadata: pineconeMetadata,
        },
      ]);
    } else {
        console.warn("[SemanticMemoryStore] updateFactMemoryText: Pinecone index not available, skipping Pinecone update.");
    }
    return updatedFact;
  } catch (error) {
    console.error("[SemanticMemoryStore] Error in updateFactMemoryText:", error);
    return null;
  }
}

/**
 * Updates the value of an existing semantic preference and its embedding in Pinecone.
 * @param {string} preferenceId - The ID of the preference to update.
 * @param {string} newPreferenceValue - The new value for the preference.
 * @returns {Promise<UserSemanticPreference | null>} The updated UserSemanticPreference object or null on failure.
 */
async function updatePreferenceMemoryValue(
  preferenceId: string,
  newPreferenceValue: string
): Promise<UserSemanticPreference | null> {
  try {
    let updatedPreference = await prisma.userSemanticPreference.update({
      where: { id: preferenceId },
      data: {
        preferenceValue: newPreferenceValue,
        updatedAt: new Date(), // Explicitly set updatedAt
      },
    });

    if (!updatedPreference) {
      console.error(`[SemanticMemoryStore] Error in updatePreferenceMemoryValue: Preference with ID ${preferenceId} not found.`);
      return null;
    }
    
    // Similar to updateFactMemoryText, using the returned record. Re-fetch if necessary.
    // updatedPreference = await prisma.userSemanticPreference.findUnique({ where: { id: preferenceId } });
    // if (!updatedPreference) return null;

    const newEmbedding = await getEmbedding(newPreferenceValue);
    if (!newEmbedding) {
      console.error("[SemanticMemoryStore] Error in updatePreferenceMemoryValue: Failed to generate new embedding.");
      return updatedPreference; // Or null
    }

    const pineconeIndex = getPineconeIndex();
    if (pineconeIndex) {
      const pineconeMetadata = {
        vectorId: updatedPreference.id,
        userId: updatedPreference.userId,
        preferenceType: updatedPreference.preferenceType.toString(),
        preferenceValue: updatedPreference.preferenceValue,
        sourceSessionId: updatedPreference.sourceSessionId || "",
        createdAt: updatedPreference.createdAt.toISOString(),
        updatedAt: updatedPreference.updatedAt.toISOString(),
        type: 'preference',
      };

      await pineconeIndex.namespace(pineconeSemanticNamespace).upsert([
        {
          id: preferenceId,
          values: newEmbedding,
          metadata: pineconeMetadata,
        },
      ]);
    } else {
        console.warn("[SemanticMemoryStore] updatePreferenceMemoryValue: Pinecone index not available, skipping Pinecone update.");
    }
    return updatedPreference;
  } catch (error) {
    console.error("[SemanticMemoryStore] Error in updatePreferenceMemoryValue:", error);
    return null;
  }
}

/**
 * Deletes a fact memory from Supabase and Pinecone.
 * @param {string} factId - The ID of the fact to delete.
 * @returns {Promise<boolean>} True if Supabase deletion was successful, false otherwise.
 */
async function deleteFactMemory(factId: string): Promise<boolean> {
  try {
    await prisma.userFact.delete({
      where: { id: factId },
    });

    const pineconeIndex = getPineconeIndex();
    if (pineconeIndex) {
      try {
        await pineconeIndex.namespace(pineconeSemanticNamespace).deleteOne(factId);
      } catch (pineconeError) {
        console.error(`[SemanticMemoryStore] Error deleting fact ${factId} from Pinecone, but Supabase delete was successful:`, pineconeError);
        // Still return true if Supabase delete was successful, as per instructions.
      }
    } else {
        console.warn("[SemanticMemoryStore] deleteFactMemory: Pinecone index not available, skipping Pinecone delete.");
    }
    return true;
  } catch (error) {
    console.error("[SemanticMemoryStore] Error in deleteFactMemory (Supabase):", error);
    return false;
  }
}

/**
 * Deletes a semantic preference from Supabase and Pinecone.
 * @param {string} preferenceId - The ID of the preference to delete.
 * @returns {Promise<boolean>} True if Supabase deletion was successful, false otherwise.
 */
async function deletePreferenceMemory(preferenceId: string): Promise<boolean> {
  try {
    await prisma.userSemanticPreference.delete({
      where: { id: preferenceId },
    });

    const pineconeIndex = getPineconeIndex();
    if (pineconeIndex) {
      try {
        await pineconeIndex.namespace(pineconeSemanticNamespace).deleteOne(preferenceId);
      } catch (pineconeError) {
        console.error(`[SemanticMemoryStore] Error deleting preference ${preferenceId} from Pinecone, but Supabase delete was successful:`, pineconeError);
      }
    } else {
        console.warn("[SemanticMemoryStore] deletePreferenceMemory: Pinecone index not available, skipping Pinecone delete.");
    }
    return true;
  } catch (error) {
    console.error("[SemanticMemoryStore] Error in deletePreferenceMemory (Supabase):", error);
    return false;
  }
}

export {
  prisma, // Exporting the prisma instance for potential direct use or testing
  pinecone, // Exporting the pinecone instance
  pineconeSemanticNamespace,
  checkConnections,
  createFactMemory,
  createPreferenceMemory,
  getFactsByUserId,
  getPreference,
  updateFactMemoryText,
  updatePreferenceMemoryValue,
  deleteFactMemory,
  deletePreferenceMemory,
  getPineconeIndex
};
