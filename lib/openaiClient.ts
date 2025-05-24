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