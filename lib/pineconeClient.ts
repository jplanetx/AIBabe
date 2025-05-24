// lib/pineconeClient.ts
import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClientInstance: Pinecone | null = null;

function initializePineconeClient(): Pinecone {
  const apiKey = process.env.PINECONE_API_KEY;
  const environment = process.env.PINECONE_ENVIRONMENT;

  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not set in the environment variables.');
  }
  if (!environment) {
    throw new Error('PINECONE_ENVIRONMENT is not set in the environment variables.');
  }

  // For current versions (e.g. 2.x.x and above), both apiKey and environment are typically required.
  return new Pinecone({ apiKey, environment });
}

export function getPineconeClient(): Pinecone {
  if (!pineconeClientInstance) {
    pineconeClientInstance = initializePineconeClient();
    console.log('Pinecone client initialized in lib/pineconeClient.ts');
  }
  return pineconeClientInstance;
}

export async function setupPineconeIndex(): Promise<string> {
  const indexName = process.env.PINECONE_INDEX_NAME;
  if (!indexName) {
    throw new Error('PINECONE_INDEX_NAME environment variable is not set.');
  }

  const dimension = 1536; // For OpenAI's text-embedding-ada-002
  const metric = 'cosine';

  const client = getPineconeClient();

  try {
    const existingIndexes = (await client.listIndexes())?.indexes?.map(i => i.name) || [];
    if (!existingIndexes.includes(indexName)) {
      console.log(`Pinecone index "${indexName}" does not exist. Creating...`);
      await client.createIndex({
        name: indexName,
        dimension: dimension,
        metric: metric,
        waitUntilReady: true, // Wait for the index to be ready before returning
        // spec: { // Specify pod-based or serverless. Default is pod.
        //   pod: {
        //     environment: process.env.PINECONE_ENVIRONMENT!, // Ensure this matches client init
        //     podType: 'p1.x1', // Choose an appropriate pod type
        //     pods: 1
        //   }
        // }
        // For simplicity, we'll rely on default pod spec or serverless if configured at account level.
        // If specific pod configuration is needed, uncomment and adjust the spec object.
      });
      console.log(`Pinecone index "${indexName}" created successfully with dimension ${dimension} and metric ${metric}.`);
    } else {
      console.log(`Pinecone index "${indexName}" already exists.`);
    }
    return indexName;
  } catch (error) {
    console.error(`Error during Pinecone index setup for "${indexName}":`, error);
    throw error;
  }
}


// Example of how you might get an index:
// export async function getPineconeIndex(indexName: string) {
//   const client = getPineconeClient();
//   // Check if index exists, and potentially create it if it doesn't (not recommended for prod on-the-fly)
//   // For now, we assume the index exists.
//   return client.Index(indexName);
// }

console.log('Pinecone client setup file loaded (lib/pineconeClient.ts). Call getPineconeClient() to initialize and setupPineconeIndex() to ensure index readiness.');