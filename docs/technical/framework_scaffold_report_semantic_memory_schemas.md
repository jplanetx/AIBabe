# Framework Scaffold Report: Semantic Memory Schemas (Task 4.1.SM)

## Date: May 30, 2025

## Orchestrator: Orchestrator (Framework Scaffolding - NL Summary to Scribe)

## Task Reference: 4.1.SM: Define Semantic Memory Schemas (from [`docs/technical/advanced_chat_semantic_memory_implementation_plan.md`](docs/technical/advanced_chat_semantic_memory_implementation_plan.md))

## 1. Summary of Scaffolding Activities

This report details the activities undertaken to define and verify the schemas for semantic memory, specifically for storing user facts and user preferences, as part of Task 4.1.SM.

The process involved:
1.  **Context Review:**
    *   Consulted the [`.pheromone`](./.pheromone) file (signals `a3b8c1d0-e2f7-4a9b-8c1d-0e9f8d7c6b5a` and `a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6`).
    *   Reviewed the Master Project Plan section: [`docs/technical/advanced_chat_semantic_memory_implementation_plan.md`](docs/technical/advanced_chat_semantic_memory_implementation_plan.md).
    *   Reviewed High-Level Acceptance Tests: [`docs/technical/advanced_chat_semantic_memory_acceptance_tests.md`](docs/technical/advanced_chat_semantic_memory_acceptance_tests.md).
    *   Reviewed existing Prisma schema: [`prisma/schema.prisma`](prisma/schema.prisma).
    *   Reviewed semantic memory architecture: [`docs/technical/semantic_memory_architecture.md`](docs/technical/semantic_memory_architecture.md).
    *   Reviewed existing Pinecone metadata schema: [`docs/schemas/semantic_memory_schema.json`](docs/schemas/semantic_memory_schema.json).

2.  **Schema Verification & Design Choices:**
    *   It was determined that the existing Prisma models [`UserFact`](prisma/schema.prisma:166) and [`UserSemanticPreference`](prisma/schema.prisma:178) (along with the enum [`SemanticPreferenceType`](prisma/schema.prisma:159)) are suitable for storing the structured metadata associated with semantic memories.
    *   The architecture document ([`docs/technical/semantic_memory_architecture.md`](docs/technical/semantic_memory_architecture.md:50-51)) clarifies that vector embeddings themselves will reside in Pinecone, not directly within the Prisma models. The Prisma `id` field serves as the link (`vectorId`) to the Pinecone vector.
    *   The existing JSON schema at [`docs/schemas/semantic_memory_schema.json`](docs/schemas/semantic_memory_schema.json) accurately defines the metadata to be stored alongside vectors in Pinecone.
    *   **Conclusion:** No modifications were required for [`prisma/schema.prisma`](prisma/schema.prisma) or [`docs/schemas/semantic_memory_schema.json`](docs/schemas/semantic_memory_schema.json) as they already align with the detailed architectural design and MPP requirements for Task 4.1.SM.

## 2. Final Schema Definitions

### 2.1. Prisma Schema (Excerpt from [`prisma/schema.prisma`](prisma/schema.prisma))

These models store the structured metadata for facts and preferences in Supabase PostgreSQL.

```prisma
// From prisma/schema.prisma

enum SemanticPreferenceType {
  TONE
  TOPIC_AVOIDANCE
  INFO_DEPTH
  // Add other preference types as needed
}

model UserFact {
  id              String    @id @default(cuid()) // Corresponds to Pinecone vectorId
  userId          String
  factText        String    @db.Text
  sourceSessionId String?   // Optional: ID of the session where this fact was learned
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User?      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model UserSemanticPreference {
  id               String                 @id @default(cuid()) // Corresponds to Pinecone vectorId
  userId           String
  preferenceType   SemanticPreferenceType
  preferenceValue  String                 @db.Text
  sourceSessionId  String?                // Optional: ID of the session where this preference was learned/set
  createdAt        DateTime               @default(now())
  updatedAt        DateTime               @updatedAt
  user             User?                   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, preferenceType])
}
```

### 2.2. Pinecone Vector Metadata Schema (from [`docs/schemas/semantic_memory_schema.json`](docs/schemas/semantic_memory_schema.json))

This JSON schema defines the metadata stored alongside each vector in Pinecone.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Pinecone Vector Metadata Schema for Semantic Memory",
  "description": "Defines the structure of metadata stored alongside vectors in Pinecone for user facts and preferences.",
  "type": "object",
  "properties": {
    "vectorId": {
      "description": "Unique identifier for the vector, corresponding to the ID from the Prisma UserFact or UserSemanticPreference model.",
      "type": "string"
    },
    "userId": {
      "description": "Identifier of the user to whom this fact or preference belongs.",
      "type": "string"
    },
    "factText": {
      "description": "The original text content of the fact. Only applicable if 'type' is 'fact'.",
      "type": "string"
    },
    "preferenceValue": {
      "description": "The value of the preference. Only applicable if 'type' is 'preference'.",
      "type": "string"
    },
    "preferenceType": {
      "description": "Specific type of preference (e.g., TONE, TOPIC_AVOIDANCE, INFO_DEPTH). Only applicable if 'type' is 'preference'.",
      "type": "string",
      "enum": ["TONE", "TOPIC_AVOIDANCE", "INFO_DEPTH"]
    },
    "sourceSessionId": {
      "description": "Optional identifier of the session where the fact or preference was learned/set.",
      "type": "string"
    },
    "createdAt": {
      "description": "ISO 8601 formatted timestamp indicating when the fact/preference was created.",
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "description": "ISO 8601 formatted timestamp indicating when the fact/preference was last updated.",
      "type": "string",
      "format": "date-time"
    },
    "type": {
      "description": "The type of semantic memory item.",
      "type": "string",
      "enum": ["fact", "preference"]
    }
  },
  "required": [
    "vectorId",
    "userId",
    "type"
  ],
  "if": {
    "properties": { "type": { "const": "preference" } }
  },
  "then": {
    "required": ["preferenceType", "preferenceValue"]
  },
   "else": {
    "required": ["factText"]
  }
}
```

## 3. Design Choices and Rationale

*   **Hybrid Storage:** The architecture ([`docs/technical/semantic_memory_architecture.md`](docs/technical/semantic_memory_architecture.md)) specifies a hybrid approach:
    *   **Supabase PostgreSQL (via Prisma):** For structured metadata, textual content of facts/preferences, user relations, and timestamps. This leverages the existing relational database and ORM.
    *   **Pinecone:** For storing vector embeddings to enable efficient similarity search.
*   **No `embedding` field in Prisma:** The `embedding` field mentioned in the MPP for Task 4.1.SM is interpreted as residing in the vector store (Pinecone), not directly in the Prisma models. The Prisma models store the source text and metadata, and the `id` of the Prisma record links to the `vectorId` in Pinecone's metadata. This aligns with the detailed architecture document.
*   **Distinct Models:** `UserFact` and `UserSemanticPreference` are distinct models, fulfilling the requirement.
*   **Timestamps:** `createdAt` and `updatedAt` fields in Prisma models fulfill the timestamping requirement. These are also reflected in the Pinecone metadata schema.
*   **Source Session ID:** The `sourceSessionId` field is included as optional in both Prisma models and the Pinecone metadata schema, allowing traceability.

## 4. Alignment with Task 4.1.SM and HLTs

*   **Task 4.1.SM Requirements:**
    *   Schema definitions exist: [`prisma/schema.prisma`](prisma/schema.prisma) and [`docs/schemas/semantic_memory_schema.json`](docs/schemas/semantic_memory_schema.json) are in place and verified.
    *   Schemas cover distinct types for facts and preferences: Achieved with `UserFact` and `UserSemanticPreference` models and the `type` field in Pinecone metadata.
    *   Fields for user identification, memory content, embedding (in Pinecone, linked by `vectorId`), and metadata (timestamps, source session ID) are covered.
*   **HLT Support:**
    *   **HLT-SM-001, HLT-SM-003 (Factual Recall):** Supported by `UserFact.factText` and associated metadata.
    *   **HLT-SM-002 (Tone Preference):** Supported by `UserSemanticPreference` with `preferenceType: "TONE"` and `preferenceValue`.
    *   **HLT-SM-004 (Content Avoidance):** Supported by `UserSemanticPreference` with `preferenceType: "TOPIC_AVOIDANCE"` and `preferenceValue`.
    *   **HLT-SM-006 (Info Depth Preference):** Supported by `UserSemanticPreference` with `preferenceType: "INFO_DEPTH"` and `preferenceValue`.
    *   The schemas provide the necessary foundation for storing the data required by these HLTs.

## 5. AI Verifiable End Results Confirmation

1.  **[`prisma/schema.prisma`](prisma/schema.prisma) updated/confirmed:** The file contains the `UserFact` and `UserSemanticPreference` models with fields as detailed above, correctly defining types and relations. No changes were needed as existing definitions align with the architecture.
2.  **[`docs/schemas/semantic_memory_schema.json`](docs/schemas/semantic_memory_schema.json) reflects non-Prisma aspects:** The file exists and accurately reflects the Pinecone metadata schema, consistent with Prisma and architectural plans. No changes were needed.
3.  **This Framework Scaffold Report:** Created and details the schema definitions, design choices, and alignment.

This concludes the framework scaffolding for semantic memory schemas as per Task 4.1.SM.