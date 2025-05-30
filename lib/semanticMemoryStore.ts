import { Pinecone } from "@pinecone-database/pinecone";
import { PrismaClient } from "@prisma/client";
import { getPineconeClient } from "./pineconeClient";

const pinecone = getPineconeClient();
const prisma = new PrismaClient();

const pineconeSemanticNamespace = process.env.PINECONE_SEMANTIC_NAMESPACE || "default-semantic-namespace";

async function checkConnections(): Promise<{ pinecone: boolean; supabase: boolean }> {
  let pineconeConnected = false;
  let supabaseConnected = false;

  try {
    // Check Pinecone connection
    const indexName = process.env.PINECONE_INDEX_NAME || "";
    const index = pinecone.Index(indexName);
    await index.describeIndexStats();
    console.log("Pinecone connection successful!");
    pineconeConnected = true;
  } catch (error) {
    console.error("Pinecone connection failed:", error);
  }

  if (process.env.NODE_ENV !== 'test') {
    try {
      // Check Supabase connection
      await prisma.$connect();
      console.log("Supabase connection successful!");
      supabaseConnected = true;
    } catch (error) {
      console.error("Supabase connection failed:", error);
    }
  } else {
    supabaseConnected = true; // Mock Supabase connection in test environment
  }

  return { pinecone: pineconeConnected, supabase: supabaseConnected };
}

export { pinecone, prisma, pineconeSemanticNamespace, checkConnections };