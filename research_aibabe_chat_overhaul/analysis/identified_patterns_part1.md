# Identified Patterns - Part 1

This document will record patterns and recurring themes identified from the collected primary and secondary findings, as well as expert insights.

## Regarding P1001 Error (Supabase/Prisma):
*   **Pattern:** The most common cause of P1001 errors with Supabase and Prisma appears to be misconfiguration of the `DATABASE_URL`.
    *   **Sub-pattern:** Incorrectly formatted connection string (not using the Supabase pooler URL/port `6543`, missing `sslmode=require`).
    *   **Sub-pattern:** Environment variable not being loaded correctly in the Next.js environment (local vs. deployment).
*   **Pattern:** Lack of `npx prisma generate` after schema or environment variable changes is a frequent oversight.
*   **Pattern:** Supabase's own documentation (specifically the Prisma troubleshooting page) is consistently referenced as a key resource.

## Regarding Supabase Authentication in Next.js (App Router):
*   **Pattern:** The `@supabase/auth-helpers-nextjs` library (or its more recent App Router-focused successor, `@supabase/ssr`) is consistently recommended for simplifying Supabase auth integration in Next.js.
*   **Pattern:** Storing Supabase URL and anon key in `.env.local` (and ensuring `NEXT_PUBLIC_` prefix for client-side accessible ones) is standard practice.
*   **Pattern:** Using server-side session management with cookies is preferred for security and persistence.
*   **Pattern:** Middleware is the common approach for protecting API routes (Route Handlers in App Router).
*   **Pattern:** Row-Level Security (RLS) in Supabase is crucial for managing access to user-specific data, like profiles.
*   **Pattern:** Confusion or outdated examples exist regarding client-side hooks (`useSession`) versus true server-side session checking for Server Components and Route Handlers in the App Router. Newer patterns emphasize server-side clients (e.g., `createServerClient` from `@supabase/ssr`).

## Regarding Pinecone & OpenAI Integration for Semantic Search in Next.js:
*   **Pattern:** LangChain is frequently mentioned as a helpful library for text processing, specifically chunking data before embedding and ingestion into Pinecone.
*   **Pattern:** OpenAI's `text-embedding-ada-002` (or newer compatible models) is the standard for generating vector embeddings for semantic search with Pinecone.
*   **Pattern:** Storing API keys (`OPENAI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`) in environment variables (`.env.local` for local, platform-specific secrets for deployment) and accessing them strictly server-side is a critical security measure.
*   **Pattern:** The typical workflow involves:
    1.  Chunking source text (e.g., chat messages, documents).
    2.  Generating embeddings for chunks using OpenAI.
    3.  Upserting embeddings and associated metadata into a Pinecone index.
    4.  For search: generating an embedding for the query, then querying Pinecone for similar vectors, often with metadata filters.
*   **Pattern:** Metadata storage alongside vectors in Pinecone is essential for filtering and contextualizing search results.

*(Further patterns will be added as more research is conducted across all objectives.)*