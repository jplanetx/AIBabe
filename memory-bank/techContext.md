# Tech Context - AI Girlfriend Chat Application

## 1. Core Technologies Stack

-   **Frontend Framework:** Next.js 13+ (App Router)
    -   Language: TypeScript
    -   UI Library: React
    -   Styling: Tailwind CSS
    -   Icons: `lucide-react`
-   **Backend Framework:** Next.js API Routes
    -   Language: TypeScript
-   **Database:** Supabase (PostgreSQL)
    -   ORM: Prisma
-   **Authentication:** Supabase Auth
    -   Integration: `@supabase/ssr` for server-side operations and middleware.
-   **AI & Machine Learning:**
    -   **Language Models (LLM):** OpenAI API (Models: GPT-3.5-turbo, potentially GPT-4)
        -   Client: `openai` npm package.
    -   **Embeddings:** OpenAI API (Model: `text-embedding-ada-002`)
    -   **Vector Database:** Pinecone
        -   Client: `@pinecone-database/pinecone` npm package.
-   **Deployment Platform:** Vercel (assumed, common for Next.js projects)

## 2. Development Setup & Environment

-   **Node.js Environment:** Specific version managed by project (e.g., via `.nvmrc` or `package.json` engines field).
-   **Package Manager:** `npm` or `yarn` (based on `package-lock.json` or `yarn.lock`).
-   **Environment Variables:** Managed via `.env` files (e.g., `.env.local`). Critical variables include:
    -   `OPENAI_API_KEY`
    -   `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME`
    -   `DATABASE_URL` (for Prisma, pointing to Supabase)
    -   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   `SUPABASE_SERVICE_ROLE_KEY`
-   **Prisma Workflow:**
    -   Schema definition: `prisma/schema.prisma`
    -   Client generation: `npx prisma generate` (CRITICAL after schema changes)
    -   Migrations: `npx prisma migrate dev`
-   **TypeScript Configuration:** `tsconfig.json` defines compiler options and project structure.

## 3. Technical Constraints & Considerations

-   **Serverless Environment:** Next.js API routes run in a serverless environment, which has implications for connection management (e.g., Prisma client instantiation).
-   **Cold Starts:** Serverless functions might experience cold starts; optimize for performance.
-   **API Rate Limits:** OpenAI, Pinecone, and Supabase APIs have rate limits that need to be handled gracefully (e.g., with retries, exponential backoff).
-   **Token Limits:** OpenAI models have context window token limits. Prompts, including conversation history and semantic context, must be managed to fit within these limits.
-   **Security:**
    -   API keys and sensitive credentials must be stored securely (environment variables, not hardcoded).
    -   Input validation is crucial for all API routes.
    -   Authentication and authorization must be enforced on protected routes.
-   **Cost Management:** Usage of OpenAI and Pinecone APIs incurs costs; monitor and optimize usage.

## 4. Key Dependencies & Libraries (Illustrative)

-   `next`: Core Next.js framework.
-   `react`, `react-dom`: UI library.
-   `typescript`: Language superset.
-   `tailwindcss`: CSS framework.
-   `lucide-react`: Icon library.
-   `@prisma/client`: Prisma ORM client.
-   `prisma`: Prisma CLI (dev dependency).
-   `@supabase/supabase-js`: Supabase client library.
-   `@supabase/ssr`: Supabase server-side rendering utilities.
-   `openai`: OpenAI Node.js client library.
-   `@pinecone-database/pinecone`: Pinecone client library.
-   Standard utility libraries (e.g., for date handling, validation).

## 5. Tool Usage Patterns

-   **Prisma CLI:** Used for schema migrations (`migrate dev`), client generation (`generate`), and database introspection (`db pull`, `db push`).
-   **Next.js CLI:** Used for development server (`next dev`), building (`next build`), and starting production server (`next start`).
-   **Package Manager CLI (npm/yarn):** For installing dependencies, running scripts defined in `package.json`.
-   **Git:** For version control.

## 6. Current Debugging Context (Relevant to Tech Stack)
-   The ongoing issue with "Property 'userProfile' does not exist on type 'PrismaClient'" highlights the critical dependency on `npx prisma generate` being run successfully after any changes to `prisma/schema.prisma` or when the Prisma client might be out of sync.
-   The transition from NextAuth to Supabase Auth for session management in API routes implies careful handling of Supabase client initialization (`createServerClient`) and cookie-based sessions.
-   Styling issues (e.g., text visibility on focus, black text on black background) point to the need for careful Tailwind CSS class application and testing across different states.
