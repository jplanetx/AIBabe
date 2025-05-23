// File: lib/vector_db.ts
import { prisma } from './prisma'; // Shared Prisma client

// --- Configuration Placeholders ---
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "YOUR_PINECONE_API_KEY_PLACEHOLDER";
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT || "YOUR_PINECONE_ENVIRONMENT_PLACEHOLDER";
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "ai-babe-chat";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "YOUR_OPENAI_API_KEY_PLACEHOLDER";
const EMBEDDING_MODEL = "text-embedding-ada-002"; // Example OpenAI model

// --- Placeholder Pinecone Client ---
interface PineconeVector {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

interface UpsertResponse {
  upsertedCount: number;
}

interface SemanticSearchResult {
  id: string;
  text: string; // Text content of the matched message/chunk
  score: number;
  conversationId?: string;
  userId?: string;
  createdAt?: string;
}

// This is a mock Pinecone client. A real client would be imported from '@pinecone-database/pinecone'.
const pineconeClientMock = {
  index: (indexName: string) => ({
    async upsert(vectors: PineconeVector[]): Promise<UpsertResponse> {
      console.log(`VECTOR_DB_INFO: [Mock Pinecone] Upserting ${vectors.length} vectors to index '${indexName}'.`);
      if (vectors.length > 0) {
        vectors.forEach(v => console.log(`VECTOR_DB_INFO: [Mock Pinecone] Vector ID: ${v.id}, Metadata: ${JSON.stringify(v.metadata)}`));
      }
      // Simulate successful upsert
      return { upsertedCount: vectors.length };
    },
    // Add other methods like query, delete as needed for TASK 3 Part 2
    async query(queryRequest: { vector: number[], topK: number, includeMetadata?: boolean }): Promise<any> { // Refined signature
      console.log(`VECTOR_DB_INFO: [Mock Pinecone] Querying index '${indexName}' with a vector (first 3 dims: ${queryRequest.vector.slice(0,3)}...). TopK: ${queryRequest.topK}`); // Refined logging
      // Simulate some results
      return {
        matches: [
          { id: "mockMatch1", score: 0.9, metadata: { text: "This is a mock search result." } },
          { id: "mockMatch2", score: 0.8, metadata: { text: "Another similar mock result." } },
        ]
      };
    }
  }),
  // Simulate init
  async init(config: { apiKey: string, environment: string }) {
    console.log(`VECTOR_DB_INFO: [Mock Pinecone] Initializing with env: ${config.environment}.`);
    // No-op for mock
  }
};

// Initialize mock client (in a real app, this happens once)
pineconeClientMock.init({ apiKey: PINECONE_API_KEY, environment: PINECONE_ENVIRONMENT });
const pineconeIndex = pineconeClientMock.index(PINECONE_INDEX_NAME);


// --- Placeholder OpenAI Embedding Generation ---
/**
 * Simulates generating embeddings for a text string.
 * In a real implementation, this would call the OpenAI API.
 * @param text The text to generate embeddings for.
 * @returns A promise that resolves to an array of numbers (embedding).
 */
async function getOpenAiEmbedding(text: string): Promise<number[]> {
  console.log(`VECTOR_DB_INFO: [Mock OpenAI] Generating embedding for text (length: ${text.length}): "${text.substring(0, 50)}..."`);
  // Simulate an embedding. A real embedding would have many dimensions (e.g., 1536 for ada-002).
  // For simplicity, using a small array.
  if (!text || text.trim().length === 0) {
    console.log("VECTOR_DB_INFO: [Mock OpenAI] Empty text received, returning empty embedding.");
    return []; // Handle empty text
  }
  const embedding = Array(10).fill(0).map(() => Math.random()); // Dummy 10-dimensional embedding
  console.log(`VECTOR_DB_INFO: [Mock OpenAI] Generated dummy embedding, first 3 dims: ${embedding.slice(0,3)}`);
  return embedding;
}

// --- Data Ingestion Pipeline ---

/**
 * Chunks text into smaller pieces if necessary.
 * For now, we'll treat each message as a single chunk.
 * @param messageText The text of the message.
 * @returns An array of text chunks.
 */
function chunkText(messageText: string): string[] {
  // Simple chunking: for now, each message is its own chunk.
  // A more sophisticated approach might split long messages.
  return [messageText];
}

/**
 * Prepares and upserts a message to the vector DB.
 * @param messageId The ID of the message.
 * @param conversationId The ID of the conversation.
 * @param userId The ID of the user (owner of the conversation).
 * @param messageText The text of the message.
 * @param messageTimestamp The timestamp of the message.
 */
export async function ingestMessageToVectorDB(
  messageId: string,
  conversationId: string,
  userId: string,
  messageText: string,
  messageTimestamp: Date
): Promise<void> {
  try {
    console.log(`VECTOR_DB_INFO: Starting ingestion for messageId: ${messageId}`);
    const textChunks = chunkText(messageText);
    if (textChunks.length === 0 || textChunks[0].trim().length === 0) {
        console.log(`VECTOR_DB_INFO: Skipping ingestion for messageId ${messageId} as it's empty after chunking.`);
        return;
    }

    for (const chunk of textChunks) {
      if (chunk.trim().length === 0) {
        console.warn(`VECTOR_DB_WARN: Skipping upsert for an empty chunk from messageId ${messageId}.`);
        continue; // Skip empty chunks
      }

      const embedding = await getOpenAiEmbedding(chunk);
      if (embedding.length === 0) {
          console.warn(`VECTOR_DB_WARN: Skipping upsert for a chunk from messageId ${messageId} due to empty embedding.`);
          continue;
      }

      const vector: PineconeVector = {
        id: messageId, // Using messageId as the vector ID. If chunking, might need messageId + chunkIndex.
        values: embedding,
        metadata: {
          conversationId,
          userId,
          text: chunk, // Store the original text chunk for context
          createdAt: messageTimestamp.toISOString(),
        },
      };
      
      // In a real scenario, you might batch upserts.
      const upsertResult = await pineconeIndex.upsert([vector]);
      console.log(`VECTOR_DB_INFO: Upsert result for messageId ${messageId}:`, upsertResult);
    }
  } catch (error) {
    console.error(`VECTOR_DB_ERROR: Failed to ingest message ${messageId} to Vector DB:`, error);
  }
}

/**
 * Example function to be called from elsewhere (e.g., after a message is saved).
 * This function would fetch necessary details if not passed directly.
 * For now, it's a placeholder for where the ingestion logic would be triggered.
 * @param messageId The ID of the newly saved message.
 */
export async function triggerVectorIngestionForMessage(messageId: string): Promise<void> {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: true }, // To get userId and conversationId
  });

  if (!message) {
    console.error(`VECTOR_DB_ERROR: Message with ID ${messageId} not found for vector ingestion.`);
    return;
  }

  if (!message.conversation || !message.conversation.userId) {
    console.error(`VECTOR_DB_ERROR: Conversation or userId missing for message ID ${messageId}.`);
    return;
  }
  
  // We only want to ingest user messages for semantic search of their past interactions.
  // Or, we might want to ingest AI messages too, depending on the use case.
  // For now, let's assume we ingest all messages.
  await ingestMessageToVectorDB(
    message.id,
    message.conversationId,
    message.conversation.userId,
    message.content, // 'text' field in Message model is 'content'
    message.createdAt
  );
}

/**
 * Queries the vector DB for semantically similar messages.
 * @param queryText The text to search for.
 * @param userId The ID of the user, to potentially scope the search.
 * @param topK The number of similar results to return.
 * @returns A promise that resolves to an array of SemanticSearchResult objects.
 */
export async function queryVectorDB(
  queryText: string,
  userId: string, // Added userId for potential filtering, though mock doesn't use it yet
  topK: number = 3
): Promise<SemanticSearchResult[]> {
  try {
    if (!queryText || queryText.trim().length === 0) {
      console.log("VECTOR_DB_INFO: [Query] Empty query text, returning no results.");
      return [];
    }

    console.log(`VECTOR_DB_INFO: [Query] Generating embedding for query: "${queryText.substring(0,50)}..."`);
    const queryEmbedding = await getOpenAiEmbedding(queryText);

    if (queryEmbedding.length === 0) {
      console.log("VECTOR_DB_INFO: [Query] Failed to generate embedding for query, returning no results.");
      return [];
    }
    
    // In a real Pinecone query, you might use filters e.g., filter: { userId: userId }
    // The mock query function in pineconeIndex doesn't currently support filters,
    // but we pass userId to show intent.
    console.log(`VECTOR_DB_INFO: [Query] Querying Pinecone index with topK=${topK} for userId=${userId} (userId not used by mock).`);
    const queryResponse = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
      // filter: { userId: userId } // Example of how filtering might look
      // The mock implementation of query in pineconeClientMock needs to handle this if we want to test filtering
      // For now, the mock query returns fixed results.
    });

    if (!queryResponse || !queryResponse.matches) {
      console.log("VECTOR_DB_INFO: [Query] No matches found or invalid response from vector DB.");
      return [];
    }

    console.log(`VECTOR_DB_INFO: [Query] Received ${queryResponse.matches.length} matches from vector DB.`);
    const results: SemanticSearchResult[] = queryResponse.matches.map((match: any) => ({
      id: match.id,
      text: match.metadata?.text || "",
      score: match.score,
      conversationId: match.metadata?.conversationId,
      userId: match.metadata?.userId,
      createdAt: match.metadata?.createdAt,
    }));
    
    return results;

  } catch (error) {
    console.error("VECTOR_DB_ERROR: [Query] Failed to query Vector DB:", error);
    return []; // Return empty array on error
  }
}
