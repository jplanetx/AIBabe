# Data Storage Architecture

This document outlines the data storage strategy for the AI Babe project. Understanding how and where our application's data is stored is crucial for building a reliable and scalable system.

## Guiding Principles

Our data storage choices are guided by the need to:

*   **Store structured data reliably:** For things like user accounts, conversation history, and application settings.
*   **Enable advanced search capabilities:** Specifically, allowing users to search conversations based on meaning (semantic search), not just keywords.
*   **Maintain clarity and simplicity:** Using the right tool for the right job.

## Core Data Storage Services

We utilize two primary cloud services for data storage:

1.  **Supabase (PostgreSQL)**
2.  **Pinecone**

Let's look at each one.

### 1. Supabase (PostgreSQL)

*   **Role:** Primary Relational Database
*   **Purpose:** Supabase provides a hosted PostgreSQL database, which is a powerful and widely-used open-source relational database. We use it to store all the core, structured data of our application. This includes:
    *   User accounts and profiles
    *   Girlfriend character details
    *   Conversation metadata (who participated, when it started)
    *   Individual messages within conversations
    *   User preferences and settings
    *   Subscription information
    *   Application feedback
*   **Why Supabase?**
    *   **Relational Integrity:** PostgreSQL is excellent for maintaining relationships between different pieces of data (e.g., a message belongs to a conversation, which belongs to a user).
    *   **Structured Data:** It's ideal for data that fits neatly into tables with predefined columns.
    *   **Prisma Integration:** We use Prisma ORM (Object-Relational Mapper) to interact with our Supabase database. This makes it easier and safer to write database queries in our TypeScript code (see [`prisma/schema.prisma`](prisma/schema.prisma:1) for our database structure).
    *   **Managed Service:** Supabase handles much of the database maintenance, backups, and scaling, allowing us to focus on application development.
    *   **Authentication & More:** Supabase also offers other backend services like authentication, which can be beneficial.

### 2. Pinecone

*   **Role:** Vector Database
*   **Purpose:** Pinecone is a specialized database designed to store and search through "vector embeddings." Vector embeddings are numerical representations of data (like text) that capture its semantic meaning. We use Pinecone to:
    *   Store vector embeddings of conversation messages.
    *   Enable semantic search: allowing the system to find messages that are semantically similar to a search query, even if they don't use the exact same words. This is key for features like "long-term memory" or finding relevant past interactions.
*   **Why Pinecone?**
    *   **Efficient Similarity Search:** Pinecone is highly optimized for performing fast similarity searches on massive datasets of vectors.
    *   **Scalability:** It's designed to scale to handle large numbers of vectors.
    *   **Developer Experience:** Provides APIs and SDKs for easier integration.

### User Authentication and Management with Supabase

    Before any chat interactions or semantic searches can occur, a user needs to be identified and authenticated. Supabase plays a critical role here:

    *   **Authentication:** Supabase provides built-in authentication services. This means it handles user sign-up (account creation), login, password management, and session management. This is a foundational piece of the application, ensuring that only legitimate users can access their data and conversations.
    *   **User Data Storage:** As mentioned, user accounts, profiles, and preferences are stored as structured data within the Supabase PostgreSQL database. This is managed via our Prisma schema ([`prisma/schema.prisma`](prisma/schema.prisma:1)).
    *   **Authorization:** Supabase's Row Level Security (RLS) policies can be (and typically are) used to ensure that users can only access their own data (e.g., their own conversations and messages).

    **In essence, Supabase is "ready" in the sense that it's our chosen platform for these core functionalities. The actual implementation of user sign-up forms, login pages, profile management UI, and the API endpoints to support these are separate development tasks but rely on Supabase as the backend service.**
## Data Flow for Semantic Search

Here's a simplified overview of how data flows between the application, Supabase, and Pinecone for the semantic search feature:

1.  **Message Creation:**
    *   A user or AI sends a message.
    *   This message (content, sender, timestamp, conversation ID, etc.) is first saved as structured data into our **Supabase (PostgreSQL)** database via Prisma.

2.  **Embedding and Ingestion into Pinecone:**
    *   After the message is saved in Supabase, its text content is processed.
    *   An AI model (e.g., from OpenAI, as configured in [`.env.local`](.env.local:2)) is used to convert the message text into a vector embedding (a list of numbers).
    *   This vector embedding, along with some metadata (like the original `messageId` from Supabase, `userId`, `conversationId`), is then stored in our **Pinecone** index (configured in [`.env.local`](.env.local:13) and managed via code in [`lib/vector_db.ts`](lib/vector_db.ts:1)).

3.  **Performing a Semantic Search:**
    *   When a user wants to search their conversation history for a concept or a past discussion:
        *   Their search query (text) is converted into a vector embedding using the same AI model.
        *   This query vector is sent to **Pinecone**.
        *   Pinecone searches its index for message vectors that are most similar (closest in "vector space") to the query vector.
        *   Pinecone returns a list of matching message IDs and their similarity scores.
    *   The application can then use these IDs to retrieve the full message content and context from **Supabase (PostgreSQL)** to display to the user.

```mermaid
graph TD
    A[Application] -- User/AI Message --> B(Save Message);
    B -- Structured Data (text, user, convoId) --> C[Supabase (PostgreSQL)];
    B -- Trigger Ingestion --> D(Process for Vector DB);
    D -- Message Text --> E[AI Embedding Model (e.g., OpenAI)];
    E -- Vector Embedding --> F(Upsert Vector);
    F -- Vector + Metadata (messageId, userId) --> G[Pinecone (Vector DB)];

    H[Application] -- Search Query --> I(Generate Query Embedding);
    I -- Query Text --> E;
    E -- Query Vector --> J(Query Pinecone);
    J -- Query Vector --> G;
    G -- Similar Vector IDs --> J;
    J -- Message IDs --> H;
    H -- Fetch Full Messages using IDs --> C;
    C -- Full Message Details --> H;
```

## Current Implementation Status

*   **Supabase (PostgreSQL):** Fully integrated and operational as the primary database for structured data. This is where we keep the "facts" about users, conversations, and messages.
*   **Pinecone (Vector Database):**
    *   **Configuration:** All necessary Pinecone credentials (API key, environment, and index name) are correctly set up in the [`.env.local`](.env.local) file. This means the application *knows how* to talk to Pinecone.
    *   **Core Logic (Mocked):** The file [`lib/vector_db.ts`](lib/vector_db.ts) contains the essential functions for:
        *   `getOpenAiEmbedding`: Simulating the creation of numerical representations (embeddings) of text.
        *   `pineconeClientMock.index().upsert`: Simulating the storing of these embeddings in Pinecone.
        *   `pineconeClientMock.index().query`: Simulating the search for similar embeddings in Pinecone.
    *   **Critical Status - Mock Implementation:** The key thing to understand is that the Pinecone client in [`lib/vector_db.ts`](lib/vector_db.ts:33) is currently a **mock client**.
        *   **Why a mock?** This is a common and good practice during early development. It allows us to build and test the surrounding logic (like how messages are processed for search) without needing a live Pinecone connection or incurring costs.
        *   **Current Limitation:** Because it's a mock, the application is **not actually sending data to or receiving data from the real Pinecone cloud service.** The semantic search and long-term memory features that depend on Pinecone are therefore not yet fully functional with live data.

## Next Steps: Activating Live Chat Improvements via Pinecone

To make the semantic search and long-term memory features fully operational (the "chat improvements" you want to test live), we need to transition from the mock Pinecone client to a live integration. This involves the following key architectural and development tasks:

1.  **Install Official Pinecone SDK:**
    *   **Action:** Add the official `@pinecone-database/pinecone` JavaScript/TypeScript SDK to the project.
    *   **Why:** This library provides the actual tools to connect and interact with your Pinecone service.
    *   **How (Example):** `npm install @pinecone-database/pinecone` or `yarn add @pinecone-database/pinecone`.

2.  **Replace Mock Pinecone Client with Real Client:**
    *   **Action:** Modify [`lib/vector_db.ts`](lib/vector_db.ts). Replace the `pineconeClientMock` object with an instance of the `PineconeClient` (or `Pinecone` depending on the SDK version) imported from the official SDK.
    *   **Configuration:** This real client must be initialized using the API key and environment variables already present in your [`.env.local`](.env.local) file.
    *   **Why:** This step establishes the actual connection to your Pinecone database in the cloud.

3.  **Implement Real Embedding Generation:**
    *   **Action:** Modify the `getOpenAiEmbedding` function in [`lib/vector_db.ts`](lib/vector_db.ts:74). Replace the current mock logic (which generates random numbers) with actual calls to an AI embedding model provider (e.g., OpenAI).
    *   **Configuration:** This will use the `OPENAI_API_KEY` from your [`.env.local`](.env.local:2) to authenticate with the OpenAI API (or a similar key for another provider if you choose a different embedding model).
    *   **Why:** Real embeddings capture the semantic meaning of the text, which is essential for effective similarity search.

4.  **Verify Pinecone Index and Operations:**
    *   **Action (Pinecone Console):** Ensure that the Pinecone index specified in your [`.env.local`](.env.local:13) (e.g., "ai-babe-vectors") exists in your Pinecone account and is configured with the correct dimensions for your chosen embedding model (e.g., OpenAI's `text-embedding-ada-002` uses 1536 dimensions).
    *   **Action (Code):** After implementing the real client, test that the application can:
        *   Successfully connect to the Pinecone index.
        *   Upsert (add or update) vector embeddings.
        *   Perform similarity queries and retrieve meaningful results.
    *   **Why:** This confirms the end-to-end connectivity and basic functionality with the live Pinecone service.

5.  **Thorough Testing:**
    *   **Action:** Test the entire flow:
        *   A new message is created in a chat.
        *   The message content is embedded.
        *   The embedding is stored in Pinecone.
        *   A semantic search query related to the message content is performed.
        *   The original message (or similar messages) are retrieved and displayed.
    *   **Why:** This ensures the chat improvements are working as expected from the user's perspective.

## Resolving Conflicts/Ambiguities

*   **Clarified Status:** The primary ambiguity regarding Pinecone's integration status is now resolved. It is architecturally intended for vector storage and semantic search, with the current implementation being a placeholder (mock) awaiting transition to the live SDK. The steps above outline this transition.
*   **Distinct Roles:** The roles of Supabase and Pinecone remain clearly distinct and complementary:
    *   **Supabase:** The definitive source for all structured relational data.
    *   **Pinecone:** The specialized database for vector embeddings, powering semantic search.

This refined strategy and clear next steps will guide the development team in activating the advanced chat features.
## Key Benefits of this Architecture

*   **Specialized Databases:** Each database (Supabase for relational, Pinecone for vector) is used for what it does best, leading to better performance and efficiency for different types of data operations.
*   **Scalability:** Both Supabase and Pinecone are managed cloud services designed to scale, allowing the application to handle growth in users and data.
*   **Rich Feature Set:** Combining these services enables complex features like semantic search and long-term memory, which would be difficult to achieve with a single, general-purpose database.
*   **Developer Productivity:** Using Prisma ORM with Supabase and SDKs for Pinecone and AI embedding services simplifies development and integration.
*   **Clear Separation of Concerns:** Structured data is clearly separated from vector data, making the system easier to understand, maintain, and evolve.

## Potential Future Enhancements/Considerations

As the application grows, we might consider the following:

*   **Advanced Pinecone Features:** Explore more advanced Pinecone features like metadata filtering during queries for more targeted search results, or using namespaces for multi-tenancy if needed.
*   **Embedding Model Updates:** Periodically review and potentially update the chosen text embedding model (e.g., from OpenAI) as newer, more performant, or cost-effective models become available.
*   **Hybrid Search:** Investigate combining keyword-based search (potentially using Supabase's full-text search) with Pinecone's semantic search for even more comprehensive search results.
*   **Data Archival & Tiering:** For very large datasets, develop strategies for archiving older conversation data from Supabase or tiering embeddings in Pinecone if cost becomes a significant factor.
*   **Monitoring & Observability:** Implement robust monitoring for both Supabase and Pinecone to track performance, usage, and costs.