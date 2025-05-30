# Master Project Plan: Advanced Chat with Semantic Memory Feature

## Overall Goal for 'Advanced Chat with Semantic Memory' Feature

To implement a system that can recall specific facts (e.g., project deadlines, user's pet names) and user preferences (e.g., communication tone, content avoidance, information depth) across different user sessions, and apply this recalled information to provide contextually aware, adaptive, and personalized responses.

**AI Verifiable End Goal (Feature):** All High-Level Acceptance Tests defined in [`docs/technical/advanced_chat_semantic_memory_acceptance_tests.md`](docs/technical/advanced_chat_semantic_memory_acceptance_tests.md) (HLT-SM-001 to HLT-SM-008) pass successfully in a staging or production-like environment.

---

## Phase 4 (Semantic Memory): Core Infrastructure Design & Setup

**Phase AI Verifiable End Goal:** Semantic memory data schemas (facts, preferences) are defined and migrated to the chosen storage solution (e.g., Supabase tables, distinct Pinecone namespace). Basic CRUD utilities for these memory types are implemented and unit-tested. Configuration for embedding models and storage clients is in place and validated.

### Micro-Tasks:

**4.1.SM: Define Semantic Memory Schemas**
*   **Description:** Design and document database/vector store schemas for storing user facts (e.g., `user_facts`: `user_id`, `fact_id`, `fact_text`, `embedding`, `source_session_id`, `timestamp`) and preferences (e.g., `user_preferences`: `user_id`, `preference_id`, `preference_type` (e.g., 'tone', 'topic_avoidance', 'info_depth'), `preference_value`, `embedding`, `source_session_id`, `timestamp`).
*   **AI Verifiable Deliverable:** Schema definitions (e.g., Prisma schema partial, JSON schema for vector metadata) exist in a designated project file (e.g., [`prisma/schema.prisma`](prisma/schema.prisma) or `docs/schemas/semantic_memory_schema.json`). Schemas cover distinct types for facts and preferences, including fields for user identification, memory content, embedding, and relevant metadata like timestamps and source session identifiers.
*   **References:** HLT-SM-001, HLT-SM-002, HLT-SM-003, HLT-SM-004, HLT-SM-006

**4.2.SM: Select and Configure Semantic Memory Storage**
*   **Description:** Evaluate and select primary storage solution(s) (e.g., Supabase PostgreSQL tables for structured metadata and potentially smaller text, Pinecone or other vector database for embeddings). Configure connection clients (e.g., in a new [`lib/semanticMemoryStore.ts`](lib/semanticMemoryStore.ts)) and necessary environment variables.
*   **AI Verifiable Deliverable:** The chosen storage solution(s) are documented in the system architecture ([`docs/system_architecture_chat_auth_search.md`](docs/system_architecture_chat_auth_search.md) or a new semantic memory architecture document). Client initialization code connects successfully to the chosen storage(s) (verified by a test script that performs a basic connection check). Necessary new environment variables (e.g., `SEMANTIC_MEMORY_DB_URL`, `PINECONE_SEMANTIC_NAMESPACE`) are added to [`.env.example`](.env.example) and configured in [`.env.local`](.env.local).

**4.3.SM: Implement Database Migrations for Semantic Memory (if SQL-based)**
*   **Description:** If using Supabase PostgreSQL tables (or another SQL database) for any part of semantic memory storage, create and apply database migrations (e.g., using Prisma) for the new schemas defined in Task 4.1.SM.
*   **AI Verifiable Deliverable:** `npx prisma migrate dev --name add_semantic_memory_tables` (or equivalent) executes successfully. The new tables and columns are visible in the Supabase (or other DB) dashboard and match the defined schemas.
*   **References:** Task 4.1.SM

**4.4.SM: Develop Basic CRUD Utilities for Semantic Memories**
*   **Description:** Implement and unit-test basic utility functions for creating, reading, updating (for corrections/preference changes), and potentially deleting individual semantic memories. These utilities will interact with the storage solution(s) configured in Task 4.2.SM.
*   **AI Verifiable Deliverable:** A set of utility functions (e.g., `createFactMemory(userId, factText, embedding, metadata)`, `getPreferenceMemory(userId, preferenceType)`, `updateFactMemory(memoryId, newFactText, newEmbedding)`, `deleteMemory(memoryId)`) exist (e.g., in [`lib/semanticMemoryStore.ts`](lib/semanticMemoryStore.ts)). Each function passes unit tests covering its basic operation against a mock or test instance of the storage.
*   **References:** HLT-SM-007

---

## Phase 5 (Semantic Memory): Memory Capture & Embedding

**Phase AI Verifiable End Goal:** Mechanisms to identify, capture, embed (using an appropriate model like OpenAI's), and securely store semantic memories (facts and preferences) from user interactions are implemented and integrated into the chat processing pipeline. Successful storage of a test fact and a test preference can be programmatically verified in the backend storage.

### Micro-Tasks:

**5.1.SM: Develop Logic to Identify Memory-Worthy Statements**
*   **Description:** Implement heuristics, keyword spotting, or a lightweight NLP model/prompting technique to identify user statements within the chat flow that likely represent persistent facts (e.g., "My cat's name is Whiskers") or preferences (e.g., "I prefer concise answers," "Don't talk about politics").
*   **AI Verifiable Deliverable:** A function/module (e.g., `identifyPotentialMemory(userInputText)`) exists. Unit tests verify that this function correctly categorizes example statements as 'fact', 'preference' (with type, e.g., 'tone_preference'), or 'not_memory_worthy'. The function should output structured data for identified memories (e.g., `{ type: 'fact', subject: 'cat_name', value: 'Whiskers' }`).

**5.2.SM: Integrate Memory Capture into Chat Flow**
*   **Description:** Modify the main chat processing logic (likely in [`app/api/chat/route.ts`](app/api/chat/route.ts) or a service it calls) to pass user messages to the memory identification logic (Task 5.1.SM).
*   **AI Verifiable Deliverable:** When a user sends a message, the chat API logs show that the `identifyPotentialMemory` function was called with the user's message content.

**5.3.SM: Implement Embedding for Captured Memories**
*   **Description:** For statements identified as memory-worthy, use the configured OpenAI API client ([`lib/openaiClient.ts`](lib/openaiClient.ts)) to generate vector embeddings of the relevant text content of the memory.
*   **AI Verifiable Deliverable:** A dedicated function (e.g., `generateMemoryEmbedding(textToEmbed)`) exists and successfully returns a vector embedding from OpenAI for a test string. This can be verified by checking the structure and dimensionality of the returned vector.

**5.4.SM: Store Embedded Memories and Metadata**
*   **Description:** After a memory is identified and its content embedded, use the CRUD utilities (Task 4.4.SM) to upsert the generated embedding along with relevant metadata (user ID, session ID if applicable, timestamp, memory type, original text, identified subject/value) into the configured semantic memory store(s).
*   **AI Verifiable Deliverable:** After processing a test user message designed to be memory-worthy (e.g., "My favorite book is Dune"), a corresponding record containing the text, its embedding, and correct metadata exists in the semantic memory store (verified by a direct backend query or a `read` utility).
*   **References:** HLT-SM-001, HLT-SM-002

---

## Phase 6 (Semantic Memory): Memory Retrieval & Application in Chat

**Phase AI Verifiable End Goal:** Relevant semantic memories (facts and preferences) are retrieved based on current chat context and user query. This retrieved information is effectively used by the LLM to generate contextually aware, personalized, and adaptive responses, successfully passing HLTs related to factual recall and preference application.

### Micro-Tasks:

**6.1.SM: Develop Semantic Memory Retrieval Algorithm**
*   **Description:** Implement logic to query the semantic memory store. This typically involves:
    1.  Embedding the current user query (or a summary of recent chat context).
    2.  Performing a similarity search (e.g., cosine similarity) in the vector store against stored memory embeddings for the current user.
    3.  Retrieving the top N most relevant memories (both facts and preferences) along with their metadata.
*   **AI Verifiable Deliverable:** A function (e.g., `retrieveRelevantMemories(userId, currentQueryEmbedding, topN)`) exists. Given a test user ID and query embedding, this function returns a structured list of relevant memory objects from a test/mock memory store, ordered by relevance. Unit tests verify retrieval logic.

**6.2.SM: Integrate Memory Retrieval into Chat Processing Logic**
*   **Description:** In the chat API ([`app/api/chat/route.ts`](app/api/chat/route.ts)), before calling the main LLM for generating a response, invoke the memory retrieval logic (Task 6.1.SM) using the current user's query/context.
*   **AI Verifiable Deliverable:** When processing a user's chat message, logs from the chat API show that the `retrieveRelevantMemories` function was called, and the (potentially empty) list of retrieved memories is logged before the main LLM is prompted.

**6.3.SM: Enhance Prompt Engineering to Utilize Recalled Memories**
*   **Description:** Modify the system prompts sent to the main LLM to include a dedicated section for any retrieved facts and preferences. Instruct the LLM to consider this information when formulating its response to enhance personalization and contextual awareness.
*   **AI Verifiable Deliverable:** For a test query where relevant memories are expected and retrieved, the final prompt sent to the LLM (observable via enhanced logging or debugging tools) includes a clearly demarcated section like "Recalled User Information & Preferences:" containing the text of the retrieved memories.

**6.4.SM: Implement Logic for Applying Preferences in Responses**
*   **Description:** Ensure that the LLM's responses demonstrably reflect recalled user preferences (e.g., communication tone, topic avoidance, preferred information depth). This is primarily achieved through effective prompt engineering (Task 6.3.SM) but may also involve light post-processing of LLM output if necessary for strict adherence.
*   **AI Verifiable Deliverable:** For test scenarios designed to trigger specific HLTs (HLT-SM-002, HLT-SM-004, HLT-SM-006), the LLM's response content and style align with the AI Verifiable Criteria outlined in those HLTs (e.g., formal tone used, avoided topic not discussed, detailed explanation provided).

---

## Phase 7 (Semantic Memory): Advanced Management, Security & Comprehensive Testing

**Phase AI Verifiable End Goal:** Advanced memory management features such as updates to facts/preferences and handling of conflicting information are functional and tested. The semantic memory system is reviewed for security and performance. All High-Level Acceptance Tests for the Semantic Memory feature (HLT-SM-001 to HLT-SM-008 in [`docs/technical/advanced_chat_semantic_memory_acceptance_tests.md`](docs/technical/advanced_chat_semantic_memory_acceptance_tests.md)) pass successfully.

### Micro-Tasks:

**7.1.SM: Implement Memory Update/Correction Logic**
*   **Description:** Develop functionality to allow new information from the user to supersede or update existing stored semantic memories. For example, if a user corrects a previously stated fact or changes a preference. This will likely involve updating records in the memory store based on memory ID or a combination of user ID and memory type/subject.
*   **AI Verifiable Deliverable:** HLT-SM-007 (Factual Recall - Correction/Update of Previously Stated Fact) passes. A test script can demonstrate that updating a memory via the CRUD utility (Task 4.4.SM) and then retrieving it shows the updated value.

**7.2.SM: Implement Preference Conflict Resolution Strategy**
*   **Description:** Define and implement a clear strategy for handling potentially conflicting preferences stated by the user at different times (e.g., prioritize the most recently stated preference for a given type).
*   **AI Verifiable Deliverable:** HLT-SM-008 (Preference Recall - Handling Potentially Conflicting Preferences - Recency Bias) passes. The system correctly applies the most recent preference when conflicting ones exist for the same preference type.

**7.3.SM: Implement Memory Clearing Functionality (Conditional)**
*   **Description:** If deemed necessary based on product requirements and HLT-SM-005, implement secure functionality allowing a user (or an administrator) to clear all or specific types of semantic memories associated with their account.
*   **AI Verifiable Deliverable:** If implemented, HLT-SM-005 (No Recall When Memory is Cleared/Disabled) passes. A test script can demonstrate that after clearing memories for a test user, subsequent queries do not recall the cleared information.

**7.4.SM: Conduct Security Review for Semantic Memory System**
*   **Description:** Perform a thorough security review of the entire semantic memory system. This includes:
    *   Data storage security (encryption at rest/transit for sensitive memories).
    *   Access control (ensuring users can only access/influence their own memories).
    *   Protection against data leakage between users.
    *   Robustness of memory identification logic against malicious inputs.
    *   Secure handling of API keys and credentials for embedding/storage services.
*   **AI Verifiable Deliverable:** A security review report is created (e.g., [`docs/security_reports/semantic_memory_security_review.md`](docs/security_reports/semantic_memory_security_review.md)). Any identified critical or high-severity vulnerabilities are documented, and a plan for their remediation is in place (or they are fixed and verified).

**7.5.SM: Perform Performance Testing for Memory Operations**
*   **Description:** Measure and, if necessary, optimize the latency of key semantic memory operations:
    *   Memory capture and embedding pipeline.
    *   Memory retrieval (querying the vector store).
    *   Overall impact on chat response time when memories are actively used.
*   **AI Verifiable Deliverable:** Performance metrics (e.g., P95 latency for memory retrieval < 500ms; P95 latency for embedding and storage < 2 seconds) are documented in a performance test report ([`docs/performance_reports/semantic_memory_performance.md`](docs/performance_reports/semantic_memory_performance.md)). Metrics meet predefined acceptable targets.

**7.6.SM: Execute All Semantic Memory High-Level Acceptance Tests**
*   **Description:** Conduct a full, systematic execution of all High-Level Acceptance Tests defined in [`docs/technical/advanced_chat_semantic_memory_acceptance_tests.md`](docs/technical/advanced_chat_semantic_memory_acceptance_tests.md) (HLT-SM-001 through HLT-SM-008).
*   **AI Verifiable Deliverable:** A test execution summary report (e.g., a markdown checklist in [`docs/test_reports/semantic_memory_hlt_execution_summary.md`](docs/test_reports/semantic_memory_hlt_execution_summary.md)) is created, showing that all HLTs pass. Any failures encountered during testing have been addressed with bug fixes, and the corresponding tests have been re-verified as passing.