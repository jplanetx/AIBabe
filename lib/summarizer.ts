// File: lib/summarizer.ts
import { prisma } from './prisma'; // Use shared prisma client
import { setConversationSummary } from './memory_crud'; // Import from the CRUD file

const MESSAGES_PER_SUMMARY_TRIGGER = 10; // Trigger summary every 10 messages

/**
 * Placeholder for calling an external LLM API to summarize text.
 * @param text The text to summarize.
 * @returns A promise that resolves to the summary string.
 */
async function callLlmApiForSummary(text: string): Promise<string> {
  console.log("SUMMARIZER_INFO: Calling placeholder LLM API for summary...");
  // In a real implementation, this would involve an HTTP request to an LLM API.
  // For now, return a dummy summary.
  if (text.length === 0) {
    return "No text to summarize.";
  }
  return `Summary of: "${text.substring(0, 50)}..." (Length: ${text.length})`;
}

/**
 * Fetches all messages for a conversation.
 * @param conversationId The ID of the conversation.
 * @returns A promise that resolves to an array of messages.
 */
async function getConversationMessages(conversationId: string): Promise<{ content: string, isUserMessage: boolean }[]> { // Updated return type
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    select: { content: true, isUserMessage: true } // Correct fields
  });
  return messages;
}

/**
 * Generates and saves a summary for a given conversation if conditions are met.
 * @param conversationId The ID of the conversation.
 */
export async function generateAndSaveSummary(conversationId: string): Promise<void> {
  try {
    const messages = await getConversationMessages(conversationId);
    if (messages.length === 0) {
      console.log(`SUMMARIZER_INFO: No messages in conversation ${conversationId} to summarize.`);
      return;
    }

    // Concatenate messages to form the text to be summarized
    // Simple concatenation for now. Might need better formatting (e.g., "User: ...", "AI: ...")
    const textToSummarize = messages.map(msg => `${msg.isUserMessage ? 'User' : 'AI'}: ${msg.content}`).join('\n'); // New version
    
    const summaryText = await callLlmApiForSummary(textToSummarize);
    
    await setConversationSummary(conversationId, summaryText, new Date());
    console.log(`SUMMARIZER_INFO: Summary saved for conversation ${conversationId}.`);

  } catch (error) {
    console.error(`SUMMARIZER_ERROR: Failed to generate or save summary for conversation ${conversationId}:`, error);
  }
}

/**
 * Checks if a summary should be triggered for a conversation based on message count.
 * @param conversationId The ID of the conversation.
 */
export async function checkAndTriggerSummary(conversationId: string): Promise<void> {
  try {
    const messageCount = await prisma.message.count({
      where: { conversationId },
    });

    console.log(`SUMMARIZER_INFO: Message count for conversation ${conversationId} is ${messageCount}.`);

    if (messageCount > 0 && messageCount % MESSAGES_PER_SUMMARY_TRIGGER === 0) {
      console.log(`SUMMARIZER_INFO: Triggering summary for conversation ${conversationId} at ${messageCount} messages.`);
      await generateAndSaveSummary(conversationId);
    }
  } catch (error) {
    console.error(`SUMMARIZER_ERROR: Failed to check or trigger summary for conversation ${conversationId}:`, error);
  }
}
