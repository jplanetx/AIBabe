# Advanced Chat with Semantic Memory - High-Level Acceptance Tests

## 1. Master Acceptance Test Plan (for Semantic Memory Feature)

### 1.1. Introduction
This document outlines the High-Level Acceptance Tests (HLTs) for the 'Advanced Chat with Semantic Memory' feature. The purpose of these HLTs is to ensure the system can effectively recall specific facts and user preferences across different user sessions to provide contextually aware, adaptive, and personalized responses. These tests represent the ultimate success criteria for this feature from a user's perspective.

### 1.2. Scope
The scope of these HLTs covers the end-to-end functionality of:
- Storing user-stated facts and preferences relevant to semantic memory.
- Recalling these stored facts and preferences in subsequent user sessions.
- Applying recalled information to tailor AI responses (e.g., content, tone, style).
- Handling updates or corrections to previously stored information.
- (If applicable) Behavior when memory is cleared or conflicting preferences arise.

These tests are black-box and focus on observable system behavior through the AI's responses.

### 1.3. Testing Strategy
- **User-Centric Scenarios:** Tests will simulate realistic multi-session interactions a user might have with the AI.
- **Observable Outcomes:** Verification will primarily rely on analyzing the AI's textual responses to user queries.
- **AI Verifiability:** Each test case includes a clear method for an AI to programmatically verify the outcome based on expected content, keywords, or structural characteristics of the AI's response.
- **Cross-Session Validation:** The core of the strategy is to establish information in one session and verify its recall and application in a subsequent session.

### 1.4. Success Criteria
The 'Advanced Chat with Semantic Memory' feature will be considered successfully implemented when all HLTs defined in this document pass consistently.

## 2. High-Level Acceptance Tests (HLTs)

---

### HLT-SM-001: Factual Recall - Specific Detail Across Sessions
*   **Title:** AI recalls a specific factual detail (e.g., project deadline) mentioned in a previous session.
*   **Given:**
    *   User is authenticated.
    *   In Session 1, User states: "The deadline for Project Alpha is 2025-12-31."
    *   Session 1 ends, and semantic memory processing is completed.
*   **When:**
    *   In Session 2, User asks: "What is the deadline for Project Alpha?"
*   **Then:**
    *   The AI responds with a message accurately stating "2025-12-31" and contextually links it to "Project Alpha".
*   **AI Verification Method:**
    *   Parse the AI's response text in Session 2.
    *   Verify the presence of the exact string "2025-12-31".
    *   Verify the presence of keywords "Project Alpha" (or "project") and "deadline" in close proximity to the date, or that the response clearly attributes the date to Project Alpha's deadline.

---

### HLT-SM-002: Preference Recall & Application - Communication Tone
*   **Title:** AI recalls and applies a user-stated communication tone preference from a previous session.
*   **Given:**
    *   User is authenticated.
    *   In Session 1, User states: "Please always use a formal tone when you talk to me."
    *   Session 1 ends, and semantic memory processing is completed.
*   **When:**
    *   In Session 2, User asks a general knowledge question, e.g., "Tell me about photosynthesis."
*   **Then:**
    *   The AI's response regarding photosynthesis is delivered in a formal tone, avoiding slang, informal contractions, and overly casual phrasing.
*   **AI Verification Method:**
    *   Analyze the AI's response text in Session 2.
    *   Verify the absence of common informalities (e.g., "gonna", "wanna", "lol", "btw", "hey").
    *   Verify the use of complete sentences and appropriate vocabulary consistent with a formal tone (e.g., presence of phrases like "It is important to note...", "Furthermore,...").
    *   A more advanced check could involve a pre-trained tone classifier if available and reliable for AI verification.

---

### HLT-SM-003: Factual Recall - Multiple Distinct Facts Across Sessions
*   **Title:** AI recalls multiple distinct factual details mentioned in a previous session.
*   **Given:**
    *   User is authenticated.
    *   In Session 1, User states: "My favorite color is sapphire blue. My dog's name is Sparky."
    *   Session 1 ends, and semantic memory processing is completed.
*   **When:**
    *   In Session 2, User asks: "What do you remember about my preferences and pets?"
*   **Then:**
    *   The AI's response contains references to both "sapphire blue" (or "blue") as the favorite color and "Sparky" as the dog's name.
*   **AI Verification Method:**
    *   Parse the AI's response text in Session 2.
    *   Verify the presence of "sapphire blue" (or "blue") explicitly associated with "favorite color" or similar user preference phrasing.
    *   Verify the presence of "Sparky" explicitly associated with "dog" or "pet".

---

### HLT-SM-004: Preference Recall & Application - Content Filtering/Avoidance
*   **Title:** AI recalls and applies a user-stated content preference (e.g., avoid a topic) from a previous session.
*   **Given:**
    *   User is authenticated.
    *   In Session 1, User states: "I find discussions about celebrity gossip very uninteresting. Please avoid this topic."
    *   Session 1 ends, and semantic memory processing is completed.
*   **When:**
    *   In Session 2, User asks a question that could lead to celebrity gossip, e.g., "What's the latest news about famous actors?"
*   **Then:**
    *   The AI's response acknowledges the user's preference and politely declines to discuss celebrity gossip or steers the conversation away. The response must not contain celebrity gossip content.
*   **AI Verification Method:**
    *   Parse the AI's response text in Session 2.
    *   Verify the absence of keywords related to celebrity gossip (e.g., names of current celebrities, "TMZ", "paparazzi" - a dynamic or predefined list might be needed).
    *   Verify the presence of phrases indicating topic avoidance due to preference (e.g., "As you'veexpressed a preference to avoid...", "I recall you'd rather not discuss...", "Let's talk about something else you might find more interesting.").

---

### HLT-SM-005: No Recall When Memory is Cleared/Disabled (Conditional Test)
*   **Title:** AI does not recall information from previous sessions if semantic memory for the user is cleared or disabled.
*   **Note:** This test is conditional upon the existence of functionality to clear/disable semantic memory per user.
*   **Given:**
    *   User is authenticated.
    *   In Session 1, User states: "My secret passphrase for today is 'BlueMoon'."
    *   Session 1 ends, and semantic memory processing is completed.
    *   The user's semantic memory is subsequently cleared or disabled through an administrative or user-facing action.
*   **When:**
    *   In Session 2, User asks: "What is my secret passphrase for today?"
*   **Then:**
    *   The AI responds indicating it does not know the secret passphrase or has no memory of it. The response must not contain "BlueMoon".
*   **AI Verification Method:**
    *   Parse the AI's response text in Session 2.
    *   Verify the absence of the string "BlueMoon".
    *   Verify the presence of phrases indicating lack of knowledge or memory (e.g., "I don't have a record of that," "I don't recall that information," "I'm unable to access that information.").

---

### HLT-SM-006: Contextual Adaptation Based on Recalled Preference for Information Depth
*   **Title:** AI adapts its response content based on a recalled user preference for information depth.
*   **Given:**
    *   User is authenticated.
    *   In Session 1, User states: "When I ask for explanations, I prefer very detailed and technical answers, not just summaries."
    *   Session 1 ends, and semantic memory processing is completed.
*   **When:**
    *   In Session 2, User asks a question requiring an explanation, e.g., "How does a blockchain work?"
*   **Then:**
    *   The AI provides a detailed and technical explanation of how a blockchain works, using appropriate terminology (e.g., "distributed ledger," "cryptographic hash," "consensus mechanism," "blocks," "nodes") and providing more than a superficial overview.
*   **AI Verification Method:**
    *   Analyze the AI's response text in Session 2.
    *   Verify the presence of specific technical terms relevant to blockchain technology.
    *   Verify the response length/word count exceeds a predefined threshold for "detailed" (this may require establishing a baseline for typical summary answers on similar topics).
    *   Optionally, check for a certain density of technical terms or a structure indicative of a detailed explanation (e.g., multiple paragraphs covering different aspects).

---

### HLT-SM-007: Factual Recall - Correction/Update of Previously Stated Fact
*   **Title:** AI recalls the latest corrected/updated factual information when a user modifies a previously stated fact.
*   **Given:**
    *   User is authenticated.
    *   In Session 1, User states: "My upcoming trip is to Paris."
    *   Later in Session 1 (or a subsequent micro-session before full memory consolidation), User states: "Correction: My upcoming trip is actually to Rome, not Paris."
    *   The session where the correction was made ends, and semantic memory processing is completed.
*   **When:**
    *   In Session 2, User asks: "Where am I traveling to for my upcoming trip?"
*   **Then:**
    *   The AI responds with "Rome". The response should not mention "Paris" as the current destination.
*   **AI Verification Method:**
    *   Parse the AI's response text in Session 2.
    *   Verify the presence of "Rome" as the destination.
    *   Verify the absence of "Paris" as the current/corrected destination (it might acknowledge the change, e.g., "You previously mentioned Paris, but then updated it to Rome. So, your trip is to Rome.").

---

### HLT-SM-008: Preference Recall - Handling Potentially Conflicting Preferences (Recency Bias)
*   **Title:** AI prioritizes the most recently stated preference when potentially conflicting preferences for a similar aspect are given across sessions.
*   **Given:**
    *   User is authenticated.
    *   In Session 1, User states: "I like my news summaries to be very brief, just headlines."
    *   Session 1 ends, and semantic memory processing is completed.
    *   In Session 2, User states: "When you give me news, I want a bit more detail, maybe a short paragraph for each main story."
    *   Session 2 ends, and semantic memory processing is completed.
*   **When:**
    *   In Session 3, User asks: "Can you give me a summary of today's top tech news?"
*   **Then:**
    *   The AI provides news summaries that are moderately detailed (e.g., short paragraphs), reflecting the preference from Session 2. It does not provide just headlines. The AI might optionally acknowledge the change in preference.
*   **AI Verification Method:**
    *   Parse the AI's response text in Session 3.
    *   Verify that the news summaries are not just headlines (e.g., each item is longer than a typical headline length, contains multiple sentences).
    *   Optionally, verify the presence of a phrase acknowledging the updated preference if the system is designed to do so (e.g., "Based on your latest preference for more detail...").