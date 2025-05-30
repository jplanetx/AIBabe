# Framework Scaffold Report: Semantic Memory Schemas

**Date:** May 30, 2025
**Target Identifier:** Semantic Memory Schemas

## 1. Objective

The objective of this scaffolding activity was to define the necessary database and vector store schemas for the Semantic Memory feature. This work aligns with Task 4.1.SM: Define Semantic Memory Schemas as outlined in the [`docs/technical/advanced_chat_semantic_memory_implementation_plan.md`](docs/technical/advanced_chat_semantic_memory_implementation_plan.md).

## 2. Activities Performed & Outcomes

The following activities were undertaken to establish the foundational schemas for semantic memory:

### 2.1. Prisma Schema Updates ([`prisma/schema.prisma`](prisma/schema.prisma))

The primary database schema, [`prisma/schema.prisma`](prisma/schema.prisma), was updated to include models and types essential for storing user-specific facts and preferences:

*   **`SemanticPreferenceType` Enum Addition:**
    *   A new enum `SemanticPreferenceType` was added with values `LIKE` and `DISLIKE` to categorize user preferences.
*   **`UserFact` Model Addition:**
    *   A new model `UserFact` was created to store factual statements about the user.
    *   Key fields include: `id` (String, CUID, primary key), `userId` (String), `text` (String), `source` (String, optional), `createdAt` (DateTime, default now), `updatedAt` (DateTime, auto-update), `user` (relation to `User` model).
*   **`UserSemanticPreference` Model Addition:**
    *   A new model `UserSemanticPreference` was created to store user preferences related to semantic concepts.
    *   Key fields include: `id` (String, CUID, primary key), `userId` (String), `preferenceType` (`SemanticPreferenceType`), `concept` (String), `source` (String, optional), `createdAt` (DateTime, default now), `updatedAt` (DateTime, auto-update), `user` (relation to `User` model).
*   **`User` Model Updates:**
    *   The existing `User` model was updated to include new relations:
        *   `facts UserFact[]`
        *   `semanticPreferences UserSemanticPreference[]`

### 2.2. Vector Store Metadata Schema Creation ([`docs/schemas/semantic_memory_schema.json`](docs/schemas/semantic_memory_schema.json))

A new JSON schema file, [`docs/schemas/semantic_memory_schema.json`](docs/schemas/semantic_memory_schema.json), was created to define the structure of metadata associated with vectors stored in Pinecone (or a similar vector database).

*   **Purpose:** This schema ensures consistency and provides a clear definition for the metadata fields accompanying each vector, facilitating efficient querying and filtering within the vector store.
*   **Key Fields Defined:**
    *   `vectorId`: (String) Unique identifier for the vector.
    *   `userId`: (String) Identifier of the user associated with this memory.
    *   `timestamp`: (String, format: date-time) Timestamp of when the memory was created or last updated.
    *   `type`: (String, enum: ["fact", "preference", "message_summary"]) Type of semantic memory.
    *   `text`: (String) The actual text content of the memory.
    *   `preferenceType`: (String, enum: ["LIKE", "DISLIKE"], optional) Type of preference, if applicable.

## 3. Summary of AI Verifiable End Results Achieved

The scaffolding activities have successfully resulted in the following AI verifiable outcomes:

*   **[`prisma/schema.prisma`](prisma/schema.prisma) Updated:** The Prisma schema file has been modified to include the `SemanticPreferenceType` enum, the `UserFact` model, the `UserSemanticPreference` model, and the necessary relational fields in the `User` model, as specified.
*   **[`docs/schemas/semantic_memory_schema.json`](docs/schemas/semantic_memory_schema.json) Created:** The JSON schema for Pinecone metadata has been created at the specified path with the correct structure and key fields (`vectorId`, `userId`, `timestamp`, `type`, `text`, `preferenceType`).

## 4. Conclusion

The schema definitions for the Semantic Memory feature are now complete. This initial setup provides a solid foundation for subsequent tasks, including database migration, data access layer implementation, and the development of services that will utilize these schemas. The defined structures support an AI verifiable and test-driven development process.