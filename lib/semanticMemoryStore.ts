import { PrismaClient, UserFact, UserSemanticPreference, SemanticPreferenceType } from '@prisma/client';
import { Pinecone, Index as PineconeIndex, RecordMetadata } from '@pinecone-database/pinecone';
import { prisma } from './prismaClient'; // Corrected import
import { getPineconeClient } from './pineconeClient'; // Corrected import

// Environment variables for semantic memory
const PINECONE_SEMANTIC_NAMESPACE = process.env.PINECONE_SEMANTIC_NAMESPACE || 'semantic-memory';
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME; // This should be set in .env

let semanticMemoryPineconeIndex: PineconeIndex<RecordMetadata> | null = null;

/**
 * Initializes and returns the Pinecone index for semantic memory.
 * Includes a basic connection check by describing index stats.
 * @returns {Promise<PineconeIndex<RecordMetadata>>} The Pinecone index instance.
 * @throws {Error} If Pinecone index name is not configured or connection fails.
 */
async function getSemanticMemoryPineconeIndex(): Promise<PineconeIndex<RecordMetadata>> {
  if (!PINECONE_INDEX_NAME) {
    throw new Error('Pinecone index name (PINECONE_INDEX_NAME) is not configured in environment variables.');
  }
  if (semanticMemoryPineconeIndex) {
    // Type assertion, as we've checked for null and it would have thrown or returned earlier if still null.
    return semanticMemoryPineconeIndex as PineconeIndex<RecordMetadata>;
  }

  try {
    const pinecone = getPineconeClient(); // Get the initialized Pinecone client
    const index = pinecone.Index<RecordMetadata>(PINECONE_INDEX_NAME);
    // Basic connection check by fetching index stats
    await index.describeIndexStats();
    console.log(`Successfully connected to Pinecone index: ${PINECONE_INDEX_NAME} for semantic memory.`);
    semanticMemoryPineconeIndex = index;
    return semanticMemoryPineconeIndex;
  } catch (error) {
    console.error('Failed to connect to or initialize Pinecone index for semantic memory:', error);
    throw new Error(`Failed to connect to Pinecone index "${PINECONE_INDEX_NAME}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Performs a basic connection check for Prisma client.
 * @throws {Error} If Prisma client connection fails.
 */
async function checkPrismaConnection(): Promise<void> {
  try {
    // Prisma client from './prismaClient' is already connected or manages its connection pool.
    // A simple query can verify its readiness.
    await prisma.user.findFirst({ select: { id: true } }); // Example query
    console.log('Successfully connected to Prisma for semantic memory operations.');
  } catch (error) {
    console.error('Prisma connection check failed for semantic memory store:', error);
    throw new Error(`Prisma connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}


/**
 * Initializes all necessary connections for the Semantic Memory Store.
 * This function should be called during application startup.
 */
export async function initializeSemanticMemoryStore(): Promise<void> {
  console.log('Initializing Semantic Memory Store...');
  await checkPrismaConnection();
  await getSemanticMemoryPineconeIndex(); // This also performs a connection check
  console.log('Semantic Memory Store initialized successfully.');
}

// Placeholder for future CRUD operations using Prisma and Pinecone for semantic memory
// Example:
// export async function createUserFactInStore(userId: string, factText: string, embedding: number[]): Promise<UserFact> {
//   const prismaFact = await prisma.userFact.create({
//     data: {
//       userId,
//       factText,
//       // sourceSessionId, // etc.
//     },
//   });
//   const pineconeIndex = await getSemanticMemoryPineconeIndex();
//   await pineconeIndex.namespace(PINECONE_SEMANTIC_NAMESPACE).upsert([
//     {
//       id: prismaFact.id,
//       values: embedding,
//       metadata: { // Adhering to docs/schemas/semantic_memory_schema.json
//         vectorId: prismaFact.id,
//         userId,
//         type: 'fact',
//         text: factText,
//         timestamp: new Date().toISOString(),
//         // preferenceType: null, // For facts
//         // preferenceValue: null, // For facts
//       } as RecordMetadata, // Cast to RecordMetadata or a more specific type if defined
//     },
//   ]);
//   return prismaFact;
// }

export { prisma as semanticPrismaClient, getSemanticMemoryPineconeIndex, PINECONE_SEMANTIC_NAMESPACE };