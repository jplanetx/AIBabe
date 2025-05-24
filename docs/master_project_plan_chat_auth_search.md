# Master Project Plan: Implement Enhanced Chat Functionality with User Authentication and Semantic Search

## Overall Project Goal

To develop and deploy a Next.js/TypeScript application featuring robust user authentication via Supabase, core chat functionalities, and advanced semantic search capabilities integrated with Pinecone and OpenAI, enabling users to engage in intelligent conversations and retrieve relevant information from chat history. The system must successfully pass all defined High-Level Acceptance Tests ([`docs/high_level_acceptance_tests_chat_auth_search.md`](docs/high_level_acceptance_tests_chat_auth_search.md)).

**AI Verifiable End Goal (Project):** All High-Level Acceptance Tests in [`docs/high_level_acceptance_tests_chat_auth_search.md`](docs/high_level_acceptance_tests_chat_auth_search.md) pass successfully in a staging or production-like environment.

---

## Phase 0: Project Setup & Foundational Configuration

**Phase AI Verifiable End Goal:** The project development environment is fully configured, all core dependencies are installed, Supabase database connectivity (including resolution of any P1001 errors) is established and verifiable via successful Prisma migrations, basic framework scaffolding (as per System Architecture section 9) is in place, and the application builds successfully without errors.

### Micro-Tasks:

1.  **Task 0.1: Initialize Next.js Project & Basic Setup**
    *   **Description:** Create a new Next.js project with TypeScript. Configure basic project settings, linting, and formatting tools.
    *   **AI Verifiable Deliverable:** A new Next.js project directory exists. `npm run dev` starts the development server successfully. `npm run build` completes without errors. Linting and formatting tools (e.g., ESLint, Prettier) are configured and can be run via npm scripts.
    *   **References:** System Architecture - Section 9.1

2.  **Task 0.2: Supabase Project Setup & Environment Configuration**
    *   **Description:** Create a new project in Supabase. Configure local environment variables ([`.env.local`](.env.local)) with Supabase URL, anon key, and direct database connection string (initially for Prisma, ensuring correct port for PgBouncer if used, e.g., 6543, or session pooler). Create/update [`.env.example`](.env.example) with placeholders.
    *   **AI Verifiable Deliverable:** [`.env.local`](.env.local) and [`.env.example`](.env.example) files exist and are populated with necessary Supabase (and other service) placeholders/keys. Supabase project is accessible via its dashboard.
    *   **References:** System Architecture - Section 9.2; HLT 4.2 (P1001 context)

3.  **Task 0.3: Install Core Dependencies**
    *   **Description:** Install necessary npm packages: `@supabase/supabase-js`, `@supabase/ssr`, `prisma`, `@prisma/client`, `@pinecone-database/pinecone`, `openai`, and any other foundational UI libraries or utilities.
    *   **AI Verifiable Deliverable:** [`package.json`](package.json) and [`package-lock.json`](package-lock.json) are updated with the specified dependencies. `npm install` completes without errors.
    *   **References:** System Architecture - Section 3 & 9

4.  **Task 0.4: Prisma Setup & Initial Schema Definition**
    *   **Description:** Initialize Prisma in the project. Define initial Prisma schema ([`prisma/schema.prisma`](prisma/schema.prisma)) for `User`, `Profile`, `Conversation`, and `Message` tables, aligning with Supabase Auth and application needs. Configure Prisma client output.
    *   **AI Verifiable Deliverable:** [`prisma/schema.prisma`](prisma/schema.prisma) is created and populated. `npx prisma generate` completes successfully, generating the Prisma client.
    *   **References:** System Architecture - Sections 3.6.1, 9.2

5.  **Task 0.5: Database Migration & Connectivity Verification (Resolve P1001)**
    *   **Description:** Create and apply an initial database migration using `prisma migrate dev`. Critically, ensure any P1001 ("Can't reach database server") errors are resolved by correctly configuring the `DATABASE_URL` in [`.env.local`](.env.local) (e.g., using the Supabase session pooler connection string `postgresql://postgres:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require` or direct URL with correct port `6543` for PgBouncer if applicable).
    *   **AI Verifiable Deliverable:** `npx prisma migrate dev --name initial_schema` (or similar) executes successfully, creating tables in the Supabase database. The Supabase dashboard reflects the new schema. No P1001 errors occur.
    *   **References:** System Architecture - Section 9.2; HLT 4.2; Pheromone Signal `f8a1b2c3-d4e5-4f6g-9h0i-7j8k9l0m1n2o` (P1001 history), `d3e0f1a2-b3c4-4d5e-8f9g-h0i1j2k3l4m5` (P1001 resolution details)

6.  **Task 0.6: Supabase Client Initialization**
    *   **Description:** Create utility files (e.g., [`lib/supabaseClients.ts`](lib/supabaseClients.ts)) to initialize and export Supabase client instances for both client-side (browser) and server-side (API routes, server components) usage, incorporating `@supabase/ssr` for cookie-based session management.
    *   **AI Verifiable Deliverable:** [`lib/supabaseClients.ts`](lib/supabaseClients.ts) (or equivalent) exists and exports configured Supabase client instances. Code referencing these clients type-checks correctly.
    *   **References:** System Architecture - Section 9.2

7.  **Task 0.7: Pinecone & OpenAI Client Initialization & Configuration**
    *   **Description:** Create utility files (e.g., [`lib/pineconeClient.ts`](lib/pineconeClient.ts), [`lib/openaiClient.ts`](lib/openaiClient.ts)) to initialize and export Pinecone and OpenAI client instances. Configure environment variables for API keys and Pinecone index details.
    *   **AI Verifiable Deliverable:** [`lib/pineconeClient.ts`](lib/pineconeClient.ts) and [`lib/openaiClient.ts`](lib/openaiClient.ts) (or equivalents) exist and export configured clients. [`.env.local`](.env.local) and [`.env.example`](.env.example) include placeholders/values for `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME`, `OPENAI_API_KEY`.
    *   **References:** System Architecture - Section 9.4

8.  **Task 0.8: Basic UI Layout and Navigation**
    *   **Description:** Create a basic application layout (header, footer, main content area) and simple navigation structure.
    *   **AI Verifiable Deliverable:** Basic layout components exist. Navigation links (e.g., to Home, Login, Chat) are present and functional (even if target pages are placeholders). Application builds and runs.

9.  **Task 0.9: Placeholder API Routes & Middleware Setup**
    *   **Description:** Create placeholder Next.js API routes for `/api/chat`, `/api/search`, `/api/user/profile`. Implement basic Next.js middleware ([`middleware.ts`](middleware.ts)) with placeholder logic for route protection (to be fully implemented in Phase 1).
    *   **AI Verifiable Deliverable:** Files for the specified API routes and [`middleware.ts`](middleware.ts) exist. API routes return a basic success response (e.g., `200 OK` with a placeholder message) when accessed. Middleware logs activity or performs a basic check.
    *   **References:** System Architecture - Sections 3.2, 9.3, 9.5

---

## Phase 1: Implement Core User Authentication (Supabase)

**Phase AI Verifiable End Goal:** Users can successfully register, log in, and log out. Authenticated routes are protected, and unauthenticated users are redirected. All High-Level Acceptance Tests related to User Authentication (HLTs 1.1, 1.2, 1.3, 1.4, 1.5) and Authenticated Access (HLTs 2.1, 2.2) pass.

### Micro-Tasks:

1.  **Task 1.1: Implement User Registration UI & Logic**
    *   **Description:** Develop the registration page UI ([`app/auth/signup/page.tsx`](app/auth/signup/page.tsx)) with email and password fields. Implement client-side logic to call `supabase.auth.signUp()`. Handle success and error responses from Supabase.
    *   **AI Verifiable Deliverable:** User can submit the registration form. On successful registration (unique email), a new user appears in Supabase `auth.users` table, and UI shows success/verification message and redirects appropriately. On registration with an existing email, an error message is displayed. (HLT 1.1, 1.5 pass)
    *   **References:** HLT 1.1, 1.5; System Architecture - Sections 3.1, 3.3, 5.1, 9.3

2.  **Task 1.2: Implement User Login UI & Logic**
    *   **Description:** Develop the login page UI ([`app/auth/login/page.tsx`](app/auth/login/page.tsx)) with email and password fields. Implement client-side logic to call `supabase.auth.signInWithPassword()`. Handle session creation and redirection on success. Display errors on failure.
    *   **AI Verifiable Deliverable:** User can submit the login form. Successful login redirects to an authenticated area (e.g., `/chat`). Failed login (incorrect credentials) displays an error message. A valid session cookie is set on successful login. (HLT 1.2, 1.3 pass)
    *   **References:** HLT 1.2, 1.3; System Architecture - Sections 3.1, 3.3, 5.2, 9.3

3.  **Task 1.3: Implement User Logout Functionality**
    *   **Description:** Create a logout button/mechanism ([`components/auth/logout-button.tsx`](components/auth/logout-button.tsx)). Implement client-side logic to call `supabase.auth.signOut()`. Handle redirection to a non-authenticated page.
    *   **AI Verifiable Deliverable:** Clicking logout terminates the session (session cookie cleared/invalidated) and redirects the user to a non-authenticated page. (HLT 1.4 passes)
    *   **References:** HLT 1.4; System Architecture - Section 9.3

4.  **Task 1.4: Implement Route Protection Middleware**
    *   **Description:** Enhance [`middleware.ts`](middleware.ts) to protect authenticated routes (e.g., `/chat`, `/dashboard`). Use Supabase server-side utilities (`@supabase/ssr`) to check for valid sessions. Redirect unauthenticated users attempting to access protected routes to the login page.
    *   **AI Verifiable Deliverable:** Unauthenticated users attempting to access `/chat` are redirected to `/login`. Authenticated users can access `/chat`. (HLT 2.1, 2.2 pass)
    *   **References:** HLT 2.1, 2.2; System Architecture - Sections 3.2, 9.5

5.  **Task 1.5: Create User Profile on Registration (Optional Enhancement)**
    *   **Description:** (If not handled by Supabase triggers) Implement logic (e.g., Supabase Function or backend API call triggered post-signup) to create a corresponding user profile entry in a public `profiles` table when a new user signs up in `auth.users`.
    *   **AI Verifiable Deliverable:** A new entry in the `profiles` table is created automatically when a user successfully registers. This can be verified by checking the database directly or by fetching profile data after login.
    *   **References:** System Architecture - Section 3.6.1

---

## Phase 2: Activate Live Pinecone Integration for Semantic Search & Core Chat

**Phase AI Verifiable End Goal:** Users can send messages in the chat interface. Messages are persisted and then embedded and upserted into a live Pinecone index. Queries from the user result in semantically relevant responses retrieved via Pinecone and processed by an LLM, or a graceful "not found" message. All High-Level Acceptance Tests related to Core Chat Functionality and Semantic Search (HLTs 3.1, 3.2, 3.3) and relevant Error Handling (HLT 4.1) pass.

### Micro-Tasks:

1.  **Task 2.1: Setup Pinecone Index**
    *   **Description:** Programmatically or manually create the required vector index in Pinecone with appropriate dimensions for OpenAI embeddings (e.g., 1536 for `text-embedding-ada-002`). Ensure connection from the application is possible.
    *   **AI Verifiable Deliverable:** Pinecone index exists and is accessible via the Pinecone client initialized in Task 0.7. Script to check index status (e.g., `pinecone.describeIndex(indexName)`) runs successfully.
    *   **References:** System Architecture - Section 3.6.2

2.  **Task 2.2: Implement Chat Message Sending API & Persistence**
    *   **Description:** Develop the backend API endpoint ([`app/api/chat/route.ts`](app/api/chat/route.ts) - POST) to receive new messages from authenticated users. Persist messages to the Supabase PostgreSQL database (using Prisma).
    *   **AI Verifiable Deliverable:** Sending a message via the UI results in a new message record in the Supabase `messages` table, linked to the correct user and conversation. The UI optimistically displays the sent message. (Part of HLT 3.1)
    *   **References:** HLT 3.1; System Architecture - Sections 3.2, 3.4, 5.3

3.  **Task 2.3: Implement Message Embedding and Upsert to Pinecone**
    *   **Description:** After a message is saved (Task 2.2), implement logic (can be asynchronous) to:
        1.  Fetch the message text.
        2.  Generate its vector embedding using the OpenAI API client.
        3.  Upsert the embedding and relevant metadata (message ID, user ID, conversation ID, timestamp) into the Pinecone index.
    *   **AI Verifiable Deliverable:** New messages saved to Supabase are subsequently embedded and appear as vectors in the Pinecone index. This can be verified by querying Pinecone for a known recent message ID or by checking Pinecone index stats. (Part of HLT 3.1)
    *   **References:** HLT 3.1; System Architecture - Sections 3.5, 5.3

4.  **Task 2.4: Implement Semantic Search Query API**
    *   **Description:** Develop the backend API endpoint ([`app/api/search/route.ts`](app/api/search/route.ts) or extend `/api/chat`) to:
        1.  Receive a user's query text.
        2.  Generate its embedding using OpenAI.
        3.  Query Pinecone with the embedding to find top N similar message vectors.
        4.  Retrieve original messages from Supabase based on IDs from Pinecone results.
        5.  (Placeholder for LLM) Return the retrieved messages or a "not found" message.
    *   **AI Verifiable Deliverable:** API endpoint successfully embeds query, queries Pinecone, and returns relevant message IDs/content or a "not found" status. Network calls to OpenAI and Pinecone are successful. (Part of HLT 3.1, 3.3)
    *   **References:** HLT 3.1, 3.3; System Architecture - Sections 3.2, 3.5, 5.4

5.  **Task 2.5: Integrate LLM for Response Generation**
    *   **Description:** Integrate an LLM (e.g., OpenAI's GPT models) into the search/chat API. Use the context from retrieved Pinecone search results (Task 2.4) and the user's current query to generate a coherent, semantically relevant natural language response.
    *   **AI Verifiable Deliverable:** The API endpoint now returns an LLM-generated response based on Pinecone search results, or a polite "I cannot answer" if no relevant context. (HLT 3.1, 3.3 fully pass for response content)
    *   **References:** HLT 3.1, 3.3; System Architecture - Section 5.4 (LLMService)

6.  **Task 2.6: Develop Chat UI for Sending/Receiving Messages**
    *   **Description:** Implement the frontend chat interface ([`app/chat/page.tsx`](app/chat/page.tsx), [`components/chat/message-input.tsx`](components/chat/message-input.tsx), [`components/chat/message-display.tsx`](components/chat/message-display.tsx)) to allow users to type and send messages, and to display the conversation history including user messages and AI responses.
    *   **AI Verifiable Deliverable:** User can type a message, send it, and see it appear in the chat display. AI responses from the backend (Task 2.5) are also displayed. Conversation flow is maintained. (HLT 3.1, 3.2 pass for UI aspects)
    *   **References:** HLT 3.1, 3.2; System Architecture - Sections 3.1, 9.3

7.  **Task 2.7: Implement Graceful Error Handling for Chat/Search Services**
    *   **Description:** Implement robust error handling in the chat and search API routes for scenarios like Pinecone/OpenAI API unavailability or unexpected errors. Return user-friendly error messages to the frontend.
    *   **AI Verifiable Deliverable:** If Pinecone or OpenAI services are simulated to be down, the UI displays a graceful error message instead of crashing or showing technical errors. (HLT 4.1 passes)
    *   **References:** HLT 4.1; System Architecture - Section 8.

---

## Phase 3: Final Review, Documentation, and Handoff Prep

**Phase AI Verifiable End Goal:** All High-Level Acceptance Tests pass consistently. Key documentation ([`docs/data_storage_architecture.md`](docs/data_storage_architecture.md)) is created/updated. The codebase is reviewed for quality and adherence to standards. The project is prepared for a conceptual handoff or next SPARC cycle (e.g., Refinement).

### Micro-Tasks:

1.  **Task 3.1: Execute All High-Level Acceptance Tests**
    *   **Description:** Systematically execute all test cases defined in [`docs/high_level_acceptance_tests_chat_auth_search.md`](docs/high_level_acceptance_tests_chat_auth_search.md). Document any failures and ensure they are addressed.
    *   **AI Verifiable Deliverable:** A test execution report (can be a markdown checklist) shows all HLTs passing. Any failed tests have corresponding bug fixes implemented and re-verified.

2.  **Task 3.2: Create/Update Data Storage Architecture Document**
    *   **Description:** Create or update the [`docs/data_storage_architecture.md`](docs/data_storage_architecture.md) document to accurately reflect the final database schemas (Supabase/Prisma) and Pinecone index structure, including data relationships and metadata.
    *   **AI Verifiable Deliverable:** [`docs/data_storage_architecture.md`](docs/data_storage_architecture.md) exists and accurately describes the data models used by Supabase/Prisma and the structure of data/metadata in Pinecone.

3.  **Task 3.3: Code Review and Quality Assurance**
    *   **Description:** Conduct a thorough code review focusing on code quality, consistency, error handling, security considerations, and performance. Address any identified issues.
    *   **AI Verifiable Deliverable:** A code review checklist or report indicates major areas reviewed and issues addressed. Linters and static analysis tools pass without critical errors.

4.  **Task 3.4: Finalize Project Documentation**
    *   **Description:** Review and update all project documentation (README, architecture docs, setup guides) to ensure accuracy and completeness.
    *   **AI Verifiable Deliverable:** Project README is up-to-date with setup, run, and build instructions. All linked documents are accurate.

5.  **Task 3.5: Prepare for Handoff / Next SPARC Cycle**
    *   **Description:** Consolidate all project artifacts, ensure the codebase is in a stable state, and prepare a summary report of the project's current status, achievements, and any known limitations or future considerations.
    *   **AI Verifiable Deliverable:** A final project status summary document/report is created. The main branch of the code repository is stable and reflects all completed work.

---