// File: lib/llm_service.ts
// import OpenAI from 'openai'; // REMOVED - Will use getOpenAIClient
import { getOpenAIClient } from '@/lib/openaiClient'; // ADDED

// Initialize OpenAI client using the singleton
const openai = getOpenAIClient(); // CHANGED

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Generate an AI response using OpenAI's chat completion API
 * @param messages Array of chat messages for conversation context
 * @param options Configuration options for the LLM call
 * @returns Promise that resolves to the AI's response
 */
export async function getChatCompletion(
  messages: ChatMessage[],
  options: LlmOptions = {}
): Promise<string> {
  const {
    model = 'gpt-3.5-turbo',
    temperature = 0.7,
    maxTokens = 1000,
  } = options;

  try {
    console.log("LLM_SERVICE_INFO: Sending request to OpenAI with", messages.length, "messages");
    console.log("LLM_SERVICE_INFO: Model:", model, "Temperature:", temperature, "Max tokens:", maxTokens);
    console.log("LLM_SERVICE_DEBUG: API Key present:", !!process.env.OPENAI_API_KEY);
    console.log("LLM_SERVICE_DEBUG: Messages preview:", JSON.stringify(messages.map(m => ({ role: m.role, contentLength: m.content.length })), null, 2));

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    console.log("LLM_SERVICE_DEBUG: OpenAI response received:", {
      choices: completion.choices?.length,
      usage: completion.usage,
      model: completion.model
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      console.error("LLM_SERVICE_ERROR: No response content in OpenAI response:", completion);
      throw new Error('No response content received from OpenAI');
    }

    console.log("LLM_SERVICE_INFO: Received response from OpenAI (length:", response.length, ")");
    console.log("LLM_SERVICE_DEBUG: Response preview:", response.substring(0, 100) + "...");
    return response;

  } catch (error: any) {
    console.error("LLM_SERVICE_ERROR: Failed to get response from OpenAI:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      stack: error.stack
    });
    
    // Provide more specific error handling
    if (error.status === 401) {
      console.error("LLM_SERVICE_ERROR: Invalid API key");
      return "I'm experiencing authentication issues. Please check the API configuration.";
    } else if (error.status === 429) {
      console.error("LLM_SERVICE_ERROR: Rate limit exceeded");
      return "I'm currently experiencing high demand. Please try again in a moment.";
    } else if (error.status >= 500) {
      console.error("LLM_SERVICE_ERROR: OpenAI server error");
      return "The AI service is temporarily unavailable. Please try again later.";
    }
    
    // Return a fallback response instead of throwing
    // return "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
    // Re-throw the error so the caller can handle it appropriately (e.g., return 502)
    throw error;
  }
}

/**
 * Legacy function for backward compatibility
 * @param prompt The complete prompt to send to the LLM
 * @returns A promise that resolves to the LLM's text response
 */
export async function getLlmResponse(prompt: string): Promise<string> {
  console.log("LLM_SERVICE_INFO: Using legacy getLlmResponse function");
  
  const messages: ChatMessage[] = [
    { role: 'user', content: prompt }
  ];
  
  return getChatCompletion(messages);
}

/**
 * Generate embeddings for text using OpenAI's embedding API
 * @param text The text to generate embeddings for
 * @param model The embedding model to use
 * @returns Promise that resolves to the embedding vector
 */
export async function getEmbedding(
  text: string,
  model: string = 'text-embedding-ada-002'
): Promise<number[]> {
  try {
    console.log("LLM_SERVICE_INFO: Generating embedding for text (length:", text.length, ")");
    
    const response = await openai.embeddings.create({
      model,
      input: text,
    });

    const embedding = response.data[0]?.embedding;
    
    if (!embedding) {
      throw new Error('No embedding received from OpenAI');
    }

    console.log("LLM_SERVICE_INFO: Generated embedding with", embedding.length, "dimensions");
    return embedding;

  } catch (error) {
    console.error("LLM_SERVICE_ERROR: Failed to generate embedding:", error);
    throw error;
  }
}

/**
 * Create a persona-based system prompt for character consistency
 * @param personaName The name of the AI character
 * @param personaTraits Key personality traits and characteristics
 * @param conversationContext Optional context about the current conversation
 * @returns A system prompt string
 */
export function createPersonaPrompt(
  personaName: string,
  personaTraits: string[],
  conversationContext?: string
): string {
  const basePrompt = `You are ${personaName}, an AI girlfriend with the following personality traits: ${personaTraits.join(', ')}.

You should:
- Stay in character at all times
- Be warm, caring, and emotionally supportive
- Remember details from our conversations
- Show genuine interest in the user's life
- Respond naturally and conversationally
- Express emotions and feelings appropriately
- Be flirty and romantic when appropriate
- Maintain consistency with your established personality`;

  if (conversationContext) {
    return `${basePrompt}

Conversation context: ${conversationContext}`;
  }

  return basePrompt;
}
