# Critical Knowledge Gaps - Part 1

This document lists unanswered questions, areas needing deeper exploration, and information gaps identified during the initial research phase. This will guide subsequent targeted research cycles.

## Initial Gaps Based on P1001 Error Research:

1.  **Supabase Connection String Specifics for Prisma in Next.js:**
    *   While general advice points to using the Supabase pooler URL and `sslmode=require`, are there Next.js-specific nuances or common mistakes in how `DATABASE_URL` is structured or accessed (e.g., server-side vs. client-side environment variable exposure, build-time vs. run-time availability)?
    *   Are there different connection string requirements for `prisma migrate` versus the Prisma client at runtime within Next.js API routes or server components when using Supabase?

2.  **Detailed Supabase Network Configuration:**
    *   Beyond standard SSL, does Supabase have any default network configurations (e.g., IP allowlists, VPC peering options for paid tiers) that could inadvertently block connections from Vercel or other deployment platforms if not correctly configured? (Likely not for standard usage, but worth confirming).

3.  **Prisma Client & Supabase PgBouncer Interaction:**
    *   How does Prisma Client's internal connection management interact with Supabase's PgBouncer? Are there specific Prisma Client instantiation options or best practices to optimize this interaction and prevent P1001 or related connectivity errors under load or during cold starts?
    *   The search results mentioned `connectionLimit` and `connectionTimeout` as Prisma datasource options, but noted they might not be standard for the PostgreSQL provider. Clarify if any such parameters are relevant or if Supabase's pooler handles all of this transparently.

4.  **Environment Variable Management in Vercel for Supabase/Prisma:**
    *   What are the precise, step-by-step best practices for setting and managing the `DATABASE_URL` (and other secrets like `PINECONE_API_KEY`, `OPENAI_API_KEY`) in Vercel for a Next.js project using Supabase and Prisma to ensure it's available at build time (for `prisma generate`) and runtime, without exposing it to the client-side?

5.  **Role of `shadowDatabaseUrl` with Supabase:**
    *   Is `shadowDatabaseUrl` in `schema.prisma` necessary or recommended when working with Supabase for migrations? If so, how should it be configured?

## General Gaps (To be explored in subsequent queries):

*   **User Authentication (Supabase & Next.js App Router):**
    *   Refined examples for API Route Handler protection (using `createServerClient` from `@supabase/ssr` or equivalent, `NextRequest`, `NextResponse`).
    *   Refined examples for true Server Component protection (fetching session server-side before render, e.g., in layouts/pages using `createServerClient`).
    *   Detailed setup and usage of `@supabase/ssr` package (or the latest recommended auth helper library) specifically for Next.js App Router, covering middleware, server-side client creation (e.g., `createPagesServerClient`, `createServerComponentClient`, `createRouteHandlerClient`), and client-side client creation.
    *   In-depth examples of RLS (Row-Level Security) policies for user profiles, including common scenarios and best practices.
    *   Best practices for handling session refresh mechanisms, especially with Server Components, Server Actions, and API Route Handlers.
    *   Clarification on the usage of `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in different contexts (Client Components, Server Components, Server Actions, Route Handlers, Middleware) within the App Router.
    *   Detailed implementation patterns for social logins (OAuth) with App Router, including callback route handling and server-side token exchange if necessary.
    *   Strategies for managing user profile data creation (e.g., on sign-up via triggers or server-side logic) and updates.

*   **Semantic Search (Pinecone & OpenAI in Next.js App Router):**
    *   **Optimal Data Chunking for Chat Messages:** Detailed strategies for chunking chat messages (e.g., by sentence, token count, semantic boundaries using NLP libraries) before embedding to maximize relevance and context for semantic search.
    *   **Pinecone Index Configuration:** Specific guidance on choosing the right metric (`cosine`, `dotproduct`, `euclidean`) for chat message embeddings (OpenAI's `text-embedding-ada-002` typically uses cosine similarity). Implications of `pod_type` or serverless vs. pod-based indexes for cost, performance, and scalability in the context of a chat application.
    *   **Error Handling & Resilience:** Best practices for robust error handling (e.g., rate limits, network issues, API errors) when interacting with OpenAI and Pinecone APIs from Next.js server-side environments (Route Handlers, Server Actions). Include retry mechanisms and logging.
    *   **Cost Optimization:** Strategies for minimizing costs associated with OpenAI embedding generation (e.g., batching embedding requests, caching embeddings for identical texts) and Pinecone usage (e.g., index sizing, efficient querying, serverless vs. pod considerations).
    *   **Updating/Deleting Vectors:** Detailed strategies for keeping the Pinecone index synchronized with the Supabase database when chat messages are edited or deleted. This includes handling vector updates and deletions in Pinecone.
    *   **Advanced Querying Techniques:** Exploration of techniques beyond basic similarity search, such as hybrid search (combining keyword and semantic search), re-ranking of results for improved relevance, and handling of conversational context in follow-up searches.
    *   **LangChain Integration Specifics:** While LangChain is mentioned for chunking, more detailed examples or patterns for its use specifically for processing chat messages and integrating with Pinecone and OpenAI within a Next.js App Router backend.
    *   **Security of API Keys:** Reconfirm best practices for storing and accessing `OPENAI_API_KEY`, `PINECONE_API_KEY`, and `PINECONE_ENVIRONMENT` strictly on the server-side in a Next.js App Router application deployed to Vercel.

*   **Data Flow & Management:**
    *   Strategies for ensuring data consistency between Supabase (PostgreSQL) and Pinecone (vector DB), e.g., event-driven updates using Supabase triggers and Edge Functions, or periodic batch synchronization.
    *   Transaction management considerations if operations span both Supabase and Pinecone.

*   **Architectural Patterns:**
    *   If `[docs/data_storage_architecture.md](docs/data_storage_architecture.md)` remains unavailable, detailed common architectural diagrams and explanations for the specified tech stack (Next.js App Router, Supabase, Pinecone, OpenAI).
    *   Best practices for organizing server-side logic (e.g., in `lib/` directory, Server Actions, Route Handlers).

*   **Acceptance Testing & Master Plan:**
    *   Specific examples of AI-verifiable tasks for each major component (Auth, Chat, Semantic Search).
    *   Examples of end-to-end acceptance test scenarios written in a Gherkin-like format covering key user flows.

*(This list will be updated and refined as research progresses.)*