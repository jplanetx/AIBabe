// lib/pineconeClient.ts
import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClientInstance: Pinecone | null = null;

function initializePineconeClient(): Pinecone {
  const apiKey = process.env.PINECONE_API_KEY;
  // const environment = process.env.PINECONE_ENVIRONMENT; // Environment is used in spec, not constructor

  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not set in the environment variables.');
  }
  // if (!environment) { // No longer check here, will be checked if needed for spec
  //   throw new Error('PINECONE_ENVIRONMENT is not set in the environment variables.');
  // }

  // Pinecone constructor typically only takes apiKey or relies on env variables.
  // Environment is specified in the index spec.
  return new Pinecone({ apiKey });
}

export function getPineconeClient(): Pinecone {
  if (!pineconeClientInstance) {
    pineconeClientInstance = initializePineconeClient();
    console.log('Pinecone client initialized in lib/pineconeClient.ts');
  }
  console.log('DEBUG: getPineconeClient returning:', pineconeClientInstance);
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
  console.log('DEBUG: In setupPineconeIndex, typeof client:', typeof client, 'client object:', client); // SIMPLER DEBUG LINE

  try {
    const existingIndexes = (await client.listIndexes())?.indexes?.map(i => i.name) || [];
    if (!existingIndexes.includes(indexName)) {
      console.log(`Pinecone index "${indexName}" does not exist. Creating...`);
      
      const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;
      if (!pineconeEnvironment) {
        throw new Error('PINECONE_ENVIRONMENT is not set, required for index spec.');
      }

      await client.createIndex({
        name: indexName,
        dimension: dimension,
        metric: metric,
        waitUntilReady: true,
        spec: {
          pod: {
            environment: pineconeEnvironment,
            podType: 'p1.x1', // Add a default podType to satisfy CreateIndexPodSpec
            pods: 1             // Add a default number of pods
          }
        }
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


/**
 * !!! TEST ONLY !!!
 * This function is exported only for testing purposes to reset the singleton instance.
 * It should not be used in production code.
 */
export function __TEST_ONLY_resetPineconeClientInstance() {
  if (process.env.NODE_ENV === 'test') {
    pineconeClientInstance = null;
    console.log('Pinecone client instance reset for testing.');
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