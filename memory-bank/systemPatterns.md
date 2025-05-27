# System Patterns - AI Girlfriend Chat Application

## 1. Core Architecture
The application follows a modern web architecture leveraging Next.js for both frontend and backend capabilities.

-   **Frontend:** Next.js (App Router) with React and TypeScript for building a responsive and interactive user interface. Tailwind CSS is used for styling.
-   **Backend:** Next.js API Routes handle client requests, business logic, and communication with external services (Supabase, OpenAI, Pinecone).
-   **Database:** Supabase (PostgreSQL) serves as the primary database, managed via Prisma ORM. It stores user data, profiles, conversation history, etc.
-   **Authentication:** Supabase Auth is the primary authentication mechanism, integrated via Next.js middleware and server-side clients.
-   **AI Services:**
    -   **LLM:** OpenAI (GPT-3.5-turbo/GPT-4) for generating chat responses.
    -   **Embeddings:** OpenAI (text-embedding-ada-002) for creating vector representations of text.
    -   **Vector Database:** Pinecone for storing and searching text embeddings, enabling semantic memory.

## 2. Key Technical Decisions & Design Patterns

-   **Serverless Functions:** Next.js API Routes provide a serverless backend, simplifying deployment and scaling.
-   **ORM:** Prisma is used for database access, providing type safety and a fluent API for interacting with Supabase PostgreSQL.
-   **Supabase Integration:**
    -   `@supabase/ssr` is used for server-side authentication and client creation in API routes and server components, ensuring consistent session handling.
    -   Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) is used for backend operations requiring elevated privileges.
-   **State Management (Client-side):** Primarily React `useState` and `useEffect` for managing component-level and local page state. For global state needs (like auth status in Navbar), React Context or a lightweight global state manager might be considered if complexity grows.
-   **Modular Services:** External interactions (OpenAI, Pinecone, Prisma) are encapsulated in dedicated library modules (e.g., `lib/llm_service.ts`, `lib/vector_db.ts`, `lib/prisma.ts`) to promote separation of concerns and testability.
-   **Environment Configuration:** Centralized environment variable management (e.g., using `.env` files and potentially a validation library like `lib/validateEnv.ts`) for API keys and service URLs.
-   **Error Handling:** Consistent error handling in API routes, returning appropriate HTTP status codes and JSON error messages.
-   **Asynchronous Operations:** Extensive use of `async/await` for handling I/O-bound operations (database queries, API calls).

## 3. Data Flow Patterns

-   **User Authentication:**
    1.  Client (e.g., Login Page) sends credentials to an auth API route (e.g., `/api/auth/login`).
    2.  API route uses Supabase client to authenticate the user.
    3.  Supabase sets HTTP-only cookies for session management.
    4.  Middleware (`middleware.ts`) and server-side components/routes use `createServerClient` from `@supabase/ssr` to access user session from cookies.
-   **Chat Message Processing:**
    1.  User sends a message via the chat interface.
    2.  Client POSTs message to `/api/chat` route.
    3.  Chat API route:
        a.  Authenticates user via Supabase session.
        b.  Retrieves conversation history (from PostgreSQL) and relevant semantic memories (from Pinecone).
        c.  Constructs a prompt for OpenAI, including persona information, history, and semantic context.
        d.  Calls OpenAI LLM service to get a response.
        e.  Saves user message and AI response to PostgreSQL.
        f.  Asynchronously sends messages to be embedded and stored in Pinecone.
        g.  Returns AI response to the client.
-   **User Profile Management:**
    1.  Client requests or updates profile data via `/api/user/profile`.
    2.  API route uses Supabase session to identify the user.
    3.  Prisma client interacts with `User` and `UserProfile` tables in Supabase PostgreSQL.

## 4. Critical Implementation Paths

-   **Authentication & Session Management:** Ensuring secure and consistent auth state across the application (client-side, server components, API routes) using Supabase.
-   **Prisma Client Generation & Synchronization:** Keeping the Prisma client (`@prisma/client`) in sync with `prisma/schema.prisma` by running `npx prisma generate` after schema changes is critical to avoid runtime and type errors.
-   **API Route Standardization:** Consistent use of Supabase for authentication and session handling in all API routes, moving away from any residual NextAuth patterns.
-   **Onboarding Flow Logic:** Correctly determining if a user has completed onboarding (e.g., by checking for `UserProfile` existence) and redirecting accordingly.
-   **Semantic Memory Pipeline:** Ensuring messages are correctly embedded and indexed in Pinecone, and that semantic search results are effectively integrated into prompts.

## 5. Styling and UI
-   **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
-   **`lucide-react`:** For icons.
-   **Component-Based Design:** UI is built using reusable React components.
