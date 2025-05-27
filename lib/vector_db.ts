// File: lib/vector_db.ts
import { prisma } from './prisma';
import { getEmbedding } from './llm_service';
import { Pinecone } from '@pinecone-database/pinecone';

// --- Configuration ---
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "ai-babe-chat";

// --- Interfaces ---
export interface PineconeVector {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export interface UpsertResponse {
  upsertedCount: number;
}

export interface SemanticSearchResult {
  id: string;
  text: string;
  score: number;
  conversationId?: string;
  userId?: string;
  createdAt?: string;
}

// --- Pinecone Client Initialization ---
let pineconeClient: Pinecone | null = null;
let pineconeIndex: any = null;

async function initializePinecone() {
  if (!pineconeClient && PINECONE_API_KEY) {
    try {
      pineconeClient = new Pinecone({
        apiKey: PINECONE_API_KEY,
      });
      
      pineconeIndex = pineconeClient.index(PINECONE_INDEX_NAME);
      console.log("VECTOR_DB_INFO: Pinecone client initialized successfully");
    } catch (error) {
      console.error("VECTOR_DB_ERROR: Failed to initialize Pinecone:", error);
      pineconeClient = null;
      pineconeIndex = null;
    }
  }
}

// Initialize on module load
initializePinecone();

// --- Fallback Mock for Development ---
const mockPineconeIndex = {
  async upsert(vectors: PineconeVector[]): Promise<UpsertResponse> {
    console.log(`VECTOR_DB_INFO: [Mock] Upserting ${vectors.length} vectors`);
    return { upsertedCount: vectors.length };
  },
  
  async query(queryRequest: { vector: number[], topK: number, includeMetadata?: boolean, filter?: any }): Promise<any> {
    console.log(`VECTOR_DB_INFO: [Mock] Querying with topK: ${queryRequest.topK}`);
    return {
      matches: [
        { 
          id: "mock1", 
          score: 0.9, 
          metadata: { 
            text: "This is a mock search result for development.",
            conversationId: "conv1",
            userId: "user1"
          } 
        },
        { 
          id: "mock2", 
          score: 0.8, 
          metadata: { 
            text: "Another mock result to simulate semantic search.",
            conversationId: "conv2", 
            userId: "user1"
          } 
        },
      ]
    };
  }
};

// --- Helper Functions ---

/**
 * Get the active Pinecone index (real or mock)
 */
function getIndex() {
  if (pineconeIndex) {
    return pineconeIndex;
  }
  console.log("VECTOR_DB_INFO: Using mock Pinecone index (no API key or initialization failed)");
  return mockPineconeIndex;
}

/**
 * Chunks text into smaller pieces if necessary
 * @param messageText The text of the message
 * @returns An array of text chunks
 */
function chunkText(messageText: string): string[] {
  // Simple chunking: for now, each message is its own chunk
  // TODO: Implement more sophisticated chunking for long messages
  if (!messageText || messageText.trim().length === 0) {
    return [];
  }
  
  // For messages longer than 1000 characters, we might want to chunk them
  const maxChunkSize = 1000;
  if (messageText.length <= maxChunkSize) {
    return [messageText];
  }
  
  // Simple sentence-based chunking
  const sentences = messageText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [messageText];
}

// --- Main Functions ---

/**
 * Prepares and upserts a message to the vector DB
 * @param messageId The ID of the message
 * @param conversationId The ID of the conversation
 * @param userId The ID of the user
 * @param messageText The text of the message
 * @param messageTimestamp The timestamp of the message
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
    if (textChunks.length === 0) {
      console.log(`VECTOR_DB_INFO: Skipping ingestion for messageId ${messageId} - no valid chunks`);
      return;
    }

    const index = getIndex();
    const vectors: PineconeVector[] = [];

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      
      try {
        const embedding = await getEmbedding(chunk);
        
        const vectorId = textChunks.length === 1 ? messageId : `${messageId}_chunk_${i}`;
        
        const vector: PineconeVector = {
          id: vectorId,
          values: embedding,
          metadata: {
            conversationId,
            userId,
            text: chunk,
            messageId,
            chunkIndex: i,
            totalChunks: textChunks.length,
            createdAt: messageTimestamp.toISOString(),
          },
        };
        
        vectors.push(vector);
      } catch (error) {
        console.error(`VECTOR_DB_ERROR: Failed to generate embedding for chunk ${i} of message ${messageId}:`, error);
      }
    }

    if (vectors.length > 0) {
      const upsertResult = await index.upsert(vectors);
      console.log(`VECTOR_DB_INFO: Successfully upserted ${vectors.length} vectors for messageId ${messageId}`);
    }

  } catch (error) {
    console.error(`VECTOR_DB_ERROR: Failed to ingest message ${messageId} to Vector DB:`, error);
  }
}

/**
 * Triggers vector ingestion for a message by ID
 * @param messageId The ID of the newly saved message
 */
export async function triggerVectorIngestionForMessage(messageId: string): Promise<void> {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      console.error(`VECTOR_DB_ERROR: Message with ID ${messageId} not found`);
      return;
    }

    if (!message.conversation || !message.conversation.userId) {
      console.error(`VECTOR_DB_ERROR: Conversation or userId missing for message ID ${messageId}`);
      return;
    }
    
    // Ingest user messages for semantic search
    // You might want to also ingest AI messages depending on use case
    await ingestMessageToVectorDB(
      message.id,
      message.conversationId,
      message.conversation.userId,
      message.content,
      message.createdAt
    );
  } catch (error) {
    console.error(`VECTOR_DB_ERROR: Failed to trigger vector ingestion for message ${messageId}:`, error);
  }
}

/**
 * Queries the vector DB for semantically similar messages
 * @param queryText The text to search for
 * @param userId The ID of the user to scope the search
 * @param topK The number of similar results to return
 * @param conversationId Optional conversation ID to filter results
 * @returns A promise that resolves to an array of SemanticSearchResult objects
 */
export async function queryVectorDB(
  queryText: string,
  userId: string,
  topK: number = 5,
  conversationId?: string
): Promise<SemanticSearchResult[]> {
  try {
    if (!queryText || queryText.trim().length === 0) {
      console.log("VECTOR_DB_INFO: Empty query text, returning no results");
      return [];
    }

    console.log(`VECTOR_DB_INFO: Querying for: "${queryText.substring(0, 50)}..." (userId: ${userId})`);
    
    const queryEmbedding = await getEmbedding(queryText);
    const index = getIndex();
    
    // Build filter for user-specific search
    const filter: any = { userId };
    if (conversationId) {
      filter.conversationId = conversationId;
    }
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: pineconeIndex ? filter : undefined, // Only use filter with real Pinecone
    });

    if (!queryResponse || !queryResponse.matches) {
      console.log("VECTOR_DB_INFO: No matches found");
      return [];
    }

    console.log(`VECTOR_DB_INFO: Found ${queryResponse.matches.length} semantic matches`);
    
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
    console.error("VECTOR_DB_ERROR: Failed to query Vector DB:", error);
    return [];
  }
}

/**
 * Retrieves conversation context by finding recent and relevant messages
 * @param conversationId The conversation ID
 * @param userId The user ID
 * @param currentMessage Optional current message for semantic similarity
 * @param maxMessages Maximum number of messages to retrieve
 * @returns Array of relevant messages for context
 */
export async function getConversationContext(
  conversationId: string,
  userId: string,
  currentMessage?: string,
  maxMessages: number = 10
): Promise<SemanticSearchResult[]> {
  try {
    // Get recent messages from the conversation
    const recentMessages = await prisma.message.findMany({
      where: {
        conversationId,
        conversation: { userId }
      },
      orderBy: { createdAt: 'desc' },
      take: maxMessages,
    });

    // If we have a current message, also get semantically similar messages
    let semanticResults: SemanticSearchResult[] = [];
    if (currentMessage && currentMessage.trim().length > 0) {
      semanticResults = await queryVectorDB(currentMessage, userId, 5, conversationId);
    }

    // Combine and deduplicate results
    const allResults = new Map<string, SemanticSearchResult>();
    
    // Add recent messages
    recentMessages.forEach((msg: any) => {
      allResults.set(msg.id, {
        id: msg.id,
        text: msg.content,
        score: 1.0, // High score for recent messages
        conversationId: msg.conversationId,
        userId,
        createdAt: msg.createdAt.toISOString(),
      });
    });
    
    // Add semantic results (they might overlap with recent messages)
    semanticResults.forEach(result => {
      if (!allResults.has(result.id)) {
        allResults.set(result.id, result);
      }
    });

    // Convert to array and sort by relevance (score) and recency
    const contextMessages = Array.from(allResults.values())
      .sort((a, b) => {
        // Prioritize by score first, then by recency
        if (Math.abs(a.score - b.score) > 0.1) {
          return b.score - a.score;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })
      .slice(0, maxMessages);

    console.log(`VECTOR_DB_INFO: Retrieved ${contextMessages.length} context messages for conversation ${conversationId}`);
    return contextMessages;

  } catch (error) {
    console.error("VECTOR_DB_ERROR: Failed to get conversation context:", error);
    return [];
  }
}
