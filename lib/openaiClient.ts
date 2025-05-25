// lib/openaiClient.ts
import OpenAI from 'openai';

let openaiClientInstance: OpenAI | null = null;

function initializeOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in the environment variables.');
  }

  return new OpenAI({ apiKey });
}

export function getOpenAIClient(): OpenAI {
  if (!openaiClientInstance) {
    openaiClientInstance = initializeOpenAIClient();
    console.log('OpenAI client initialized in lib/openaiClient.ts');
  }
  return openaiClientInstance;
}

/**
 * !!! TEST ONLY !!!
 * This function is exported only for testing purposes to reset the singleton instance.
 * It should not be used in production code.
 */
export function __TEST_ONLY_resetOpenAIClientInstance() {
  if (process.env.NODE_ENV === 'test') {
    openaiClientInstance = null;
    console.log('OpenAI client instance reset for testing.');
  }
}

// Example usage (e.g., for embeddings or chat completions):
// async function getEmbedding(text: string) {
//   const client = getOpenAIClient();
//   const response = await client.embeddings.create({
//     model: "text-embedding-ada-002", // Or another preferred model
//     input: text,
//   });
//   return response.data[0].embedding;
// }

console.log('OpenAI client setup file loaded (lib/openaiClient.ts). Call getOpenAIClient() to initialize.');