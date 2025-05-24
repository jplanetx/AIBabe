// lib/opening_messages.ts

/**
 * A predefined list of engaging and empathetic opening messages.
 */
export const OPENING_MESSAGES: readonly string[] = [
  "Hello there! It's great to connect with you. How can I help you today?",
  "Hi! I'm here and ready to chat. What's on your mind?",
  "Welcome! I'm looking forward to our conversation. What would you like to talk about?",
  "Hey! So glad to see you. Is there anything specific I can assist you with right now?",
  "Greetings! It's a pleasure to meet you. How can I make your day a little brighter?",
  "Good to see you! Let's explore your thoughts. What shall we begin with?",
];

// In-memory tracking for recently used messages per session.
// Key: sessionId (string), Value: array of indices of messages used in this session.
const recentlyUsedMessagesBySession = new Map<string, number[]>();

// In-memory tracking for the very last message used per session.
// Key: sessionId (string), Value: index of the last message used.
const lastMessageUsedBySession = new Map<string, number>();

/**
 * Selects an opening message for a given session, aiming to avoid immediate repetition.
 *
 * @param sessionId A unique identifier for the current user session.
 * @returns A string containing the selected opening message.
 * @throws Error if no opening messages are defined.
 */
export function getOpeningMessage(sessionId: string): string {
  if (!OPENING_MESSAGES || OPENING_MESSAGES.length === 0) {
    // This should ideally not happen if OPENING_MESSAGES is a non-empty constant.
    // Consider logging this error.
    throw new Error("No opening messages defined.");
  }

  let usedIndices = recentlyUsedMessagesBySession.get(sessionId) || [];
  const lastUsedIndex = lastMessageUsedBySession.get(sessionId);

  let availableMessageIndices = OPENING_MESSAGES
    .map((_, index) => index)
    .filter(index => !usedIndices.includes(index));

  let selectedIndex: number;

  if (availableMessageIndices.length > 0) {
    // Select the first available message from the filtered list
    selectedIndex = availableMessageIndices[0];
  } else {
    // All messages have been used in this cycle for this session. Reset and pick.
    // console.log(`All messages used for session ${sessionId}. Resetting.`);
    usedIndices = []; // Clear the used list for this session for rotation

    // Try to pick one different from the very last one used, if possible
    let potentialIndices = OPENING_MESSAGES.map((_, index) => index);
    if (lastUsedIndex !== undefined && potentialIndices.length > 1) {
      potentialIndices = potentialIndices.filter(index => index !== lastUsedIndex);
    }
    
    if (potentialIndices.length === 0) {
        // This case should only happen if OPENING_MESSAGES has only 1 message
        // and it was the lastUsedIndex. In this scenario, we have to repeat it.
        selectedIndex = lastUsedIndex !== undefined ? lastUsedIndex : 0;
    } else {
        selectedIndex = potentialIndices[0]; // Pick the first from the (potentially filtered) list
    }
  }

  // Update tracking
  usedIndices.push(selectedIndex);
  recentlyUsedMessagesBySession.set(sessionId, usedIndices);
  lastMessageUsedBySession.set(sessionId, selectedIndex);

  return OPENING_MESSAGES[selectedIndex];
}

/**
 * Clears the tracking history for a specific session.
 * Useful for testing or explicit session resets.
 * @param sessionId The session ID to clear history for.
 */
export function clearSessionOpeningMessageHistory(sessionId: string): void {
  recentlyUsedMessagesBySession.delete(sessionId);
  lastMessageUsedBySession.delete(sessionId);
}