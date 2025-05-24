// lib/opening_message_selector.test.ts

import {
  getOpeningMessage,
  OPENING_MESSAGES,
  clearSessionOpeningMessageHistory,
} from './opening_messages';

describe('getOpeningMessage', () => {
  const SESSION_ID_1 = 'test-session-1';
  const SESSION_ID_2 = 'test-session-2';
  const originalMessages = [...OPENING_MESSAGES]; // Keep a copy

  beforeEach(() => {
    // Clear history for all known test sessions before each test
    clearSessionOpeningMessageHistory(SESSION_ID_1);
    clearSessionOpeningMessageHistory(SESSION_ID_2);
    // Restore OPENING_MESSAGES if it was modified in a test (e.g. for empty check)
    // This is a bit of a hack; ideally, OPENING_MESSAGES would be mockable or passed in.
    // For now, we ensure it's reset if a test temporarily empties it.
    if (OPENING_MESSAGES.length !== originalMessages.length) {
        // @ts-ignore // Allow modification for testing purposes
        OPENING_MESSAGES.length = 0; // Clear it
        originalMessages.forEach(msg => {
            // @ts-ignore
            OPENING_MESSAGES.push(msg); // Repopulate
        });
    }
  });

  test('should return a valid opening message', () => {
    const message = getOpeningMessage(SESSION_ID_1);
    expect(message).toBeDefined();
    expect(typeof message).toBe('string');
    expect(OPENING_MESSAGES).toContain(message);
  });

  test('should return different messages on subsequent calls for the same session', () => {
    const numMessages = OPENING_MESSAGES.length;
    if (numMessages < 2) {
      // Test doesn't make sense if there's only 0 or 1 message
      console.warn("Skipping 'different messages' test as there are fewer than 2 opening messages.");
      return;
    }

    const firstMessage = getOpeningMessage(SESSION_ID_1);
    const secondMessage = getOpeningMessage(SESSION_ID_1);

    expect(firstMessage).not.toEqual(secondMessage);
    expect(OPENING_MESSAGES).toContain(firstMessage);
    expect(OPENING_MESSAGES).toContain(secondMessage);
  });

  test('should cycle through all messages before repeating for a session', () => {
    const numMessages = OPENING_MESSAGES.length;
    const receivedMessages = new Set<string>();

    for (let i = 0; i < numMessages; i++) {
      const message = getOpeningMessage(SESSION_ID_1);
      expect(OPENING_MESSAGES).toContain(message);
      expect(receivedMessages.has(message)).toBe(false); // Should not repeat yet
      receivedMessages.add(message);
    }

    expect(receivedMessages.size).toBe(numMessages); // All messages should have been received once

    // Next call should start rotation
    const rotatedMessage = getOpeningMessage(SESSION_ID_1);
    expect(OPENING_MESSAGES).toContain(rotatedMessage);
  });

  test('fallback behavior: when all messages used, should rotate and not pick the very last one if possible', () => {
    const numMessages = OPENING_MESSAGES.length;
    if (numMessages < 2) {
      // This specific fallback logic is less meaningful with < 2 messages
      console.warn("Skipping 'fallback not last' test as there are fewer than 2 opening messages.");
      return;
    }

    let lastMessage = '';
    for (let i = 0; i < numMessages; i++) {
      lastMessage = getOpeningMessage(SESSION_ID_1);
    }

    // All messages are now "used" for this cycle.
    // The next message should be different from `lastMessage` if numMessages > 1.
    const rotatedMessage = getOpeningMessage(SESSION_ID_1);
    expect(OPENING_MESSAGES).toContain(rotatedMessage);
    if (numMessages > 1) {
        expect(rotatedMessage).not.toEqual(lastMessage);
    } else {
        expect(rotatedMessage).toEqual(lastMessage); // Must repeat if only one message
    }
  });
  
  test('fallback behavior: if only one message exists, it should always return that message', () => {
    // @ts-ignore // Temporarily modify for this test case
    OPENING_MESSAGES.length = 0; // Clear existing
    // @ts-ignore
    OPENING_MESSAGES.push("The only message");

    const message1 = getOpeningMessage(SESSION_ID_1);
    expect(message1).toBe("The only message");
    const message2 = getOpeningMessage(SESSION_ID_1);
    expect(message2).toBe("The only message");
    const message3 = getOpeningMessage(SESSION_ID_1);
    expect(message3).toBe("The only message");
  });


  test('should throw an error if OPENING_MESSAGES is empty', () => {
    // @ts-ignore // Temporarily modify for this test case
    OPENING_MESSAGES.length = 0;
    expect(() => getOpeningMessage(SESSION_ID_1)).toThrow("No opening messages defined.");
  });

  test('should maintain separate tracking for different session IDs', () => {
    const messageS1_1 = getOpeningMessage(SESSION_ID_1);
    const messageS2_1 = getOpeningMessage(SESSION_ID_2);

    expect(messageS1_1).toEqual(OPENING_MESSAGES[0]); // Assuming fresh session starts with the first
    expect(messageS2_1).toEqual(OPENING_MESSAGES[0]); // Session 2 should also start fresh

    const messageS1_2 = getOpeningMessage(SESSION_ID_1);
    expect(messageS1_2).toEqual(OPENING_MESSAGES[1]); // Session 1 moves to next
    
    const messageS2_2 = getOpeningMessage(SESSION_ID_2);
    expect(messageS2_2).toEqual(OPENING_MESSAGES[1]); // Session 2 also moves to its next

    expect(messageS1_1).not.toEqual(messageS1_2);
    expect(messageS2_1).not.toEqual(messageS2_2);
  });

  test('clearSessionOpeningMessageHistory should reset tracking for a session', () => {
    getOpeningMessage(SESSION_ID_1); // Use one message
    getOpeningMessage(SESSION_ID_1); // Use another

    clearSessionOpeningMessageHistory(SESSION_ID_1);

    // After clearing, it should start from the beginning again for SESSION_ID_1
    const messageAfterClear = getOpeningMessage(SESSION_ID_1);
    expect(messageAfterClear).toEqual(OPENING_MESSAGES[0]);
  });

  test('should handle rapid exhaustion and rotation correctly', () => {
    const numMessages = OPENING_MESSAGES.length;
    const receivedInCycle = new Set<string>();
    let lastReceived: string | undefined = undefined;

    // Exhaust messages
    for (let i = 0; i < numMessages; i++) {
      const msg = getOpeningMessage(SESSION_ID_1);
      expect(OPENING_MESSAGES).toContain(msg);
      expect(receivedInCycle.has(msg)).toBe(false);
      receivedInCycle.add(msg);
      lastReceived = msg;
    }
    expect(receivedInCycle.size).toBe(numMessages);

    // First rotation
    const rotatedMsg1 = getOpeningMessage(SESSION_ID_1);
    expect(OPENING_MESSAGES).toContain(rotatedMsg1);
    if (numMessages > 1) {
      expect(rotatedMsg1).not.toEqual(lastReceived);
    }
    
    // Second rotation - check it's different from the first rotated one
    // and also different from the one before that (lastReceived) if possible
    const receivedInSecondCycle = new Set<string>();
    receivedInSecondCycle.add(rotatedMsg1);
    lastReceived = rotatedMsg1;

    for (let i = 1; i < numMessages; i++) {
        const msg = getOpeningMessage(SESSION_ID_1);
        expect(OPENING_MESSAGES).toContain(msg);
        expect(receivedInSecondCycle.has(msg)).toBe(false);
        receivedInSecondCycle.add(msg);
        if (numMessages > 1) {
            expect(msg).not.toEqual(lastReceived);
        }
        lastReceived = msg;
    }
    expect(receivedInSecondCycle.size).toBe(numMessages);
  });
});