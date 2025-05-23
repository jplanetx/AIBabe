# Identified Knowledge Gaps - Part 1

This document lists unanswered questions and areas requiring deeper exploration after the initial data collection phase for the AI-Babe Chat System Overhaul project. These gaps will drive targeted research cycles.

**Date of Analysis:** 2025-05-23

## I. Overall Project & User Experience Gaps

*   **Q1.1 (Primary causes of repetition):** While general chatbot best practices (context management, diverse training data - Query 1 findings) address repetition, a more direct analysis of *how* the three core proposed tasks (persistent memory, vector DB/RAG, advanced prompt engineering) specifically synergize to combat repetition in the "AI-Babe" context needs further detailing.
*   **Q1.3 (KPIs):** Specific, measurable KPIs for "reduced repetition," "increased session length," and "positive user feedback on memory/consistency" need to be defined. How are these practically measured for a chat application?
*   **Q1.4 (Next.js/Vercel Architecture):** While individual components have been researched, a holistic architectural best practice guide for integrating *all* these advanced features (memory, RAG, resilient APIs, frontend UX) specifically within a Next.js/Vercel stack needs to be synthesized.

## II. Task-Specific Gaps

### A. TASK 1 — Backend API Resilience
*   **Q2.A.3 (Exponential Backoff on Vercel):** While general principles of exponential backoff were mentioned (Query 2 findings), specific implementation details, libraries, or patterns best suited for Vercel's serverless environment (considering cold starts, execution limits) for 503/504 errors need more focused research. Are there Vercel-specific considerations or recommended npm packages for this?
*   **Q2.A.5 (Next.js/Vercel Resilience Libraries):** The search results provided general Node.js/Express patterns. Specific libraries or established patterns tailored for Next.js API route resilience on Vercel (beyond `axios-retry` or manual `fetch` loops) could be explored further.

### B. TASK 2 — Implement Persistent Memory Layer
*   **Q2.B.1 (PostgreSQL vs. MongoDB on Vercel):** While schema ideas were gathered (Query 3), a deeper dive into the pros/cons of PostgreSQL vs. MongoDB *specifically for Next.js/Vercel integration* (e.g., Vercel Postgres, Vercel KV with Redis (could be an alternative for some preferences), or MongoDB Atlas integration patterns, connection pooling, cold start implications) is needed.
*   **Q2.B.3 (Efficient Memory Load/Update):** Strategies for efficient loading/updating of user memory to minimize perceived latency in a serverless Next.js context need more concrete examples or patterns. How to handle this with potential database cold starts?
*   **Q2.B.4 (Cost-Efficient Summarization Models):** Query 3 mentioned LLM summarization. A more specific investigation into *which* LLM models (OpenAI, HuggingFace, or others) offer the best balance of summarization quality and cost-efficiency for chat logs, and practical integration patterns into Next.js API routes, is required.
*   **Q2.B.5 (PII Handling in Summaries):** This critical question needs dedicated research. What are technical and procedural best practices for identifying and redacting/anonymizing PII from conversation data before or during summarization and storage?

### C. TASK 3 — Add Semantic Memory (Vector DB)
*   **Q3.C.1 (Vector DB Comparison for Next.js/Vercel):** Query 4 provided a general comparison. A more focused comparison of Pinecone, Weaviate, and *specifically Supabase pgvector* (as it's often paired with Next.js/Vercel) regarding ease of integration with Next.js API routes on Vercel, client-side vs. server-side querying strategies, and actual cost implications for the specified use case (chat semantic memory) is needed.
*   **Q3.C.3 (Optimal Chunking & Metadata for Chat):** While chunking was mentioned (Query 4), best practices for chunking *chat conversation turns* (which can be short and highly contextual) versus longer documents need exploration. What specific metadata (e.g., speaker, timestamp, session ID, emotional tone if detectable) is most beneficial for chat RAG?
*   **Q3.C.6 (Vector DB Data Management/Security):** This question needs more specific details beyond general database security. What are the data backup, export, and specific security considerations (e.g., access control to embedding models and vector data) when using Pinecone, Weaviate, or pgvector in a Vercel-hosted application?

### D. TASK 4 — Fix Persona Drift via Prompt Engineering
*   **Q4.D.4 (PersonaGym Method):** Query 5 confirmed "PersonaGym" is not a standard term. Further investigation is needed to determine if the user had a specific internal or niche methodology in mind. If not, the research should focus on finding well-regarded, structured methodologies for persona definition, enforcement, and evaluation that are analogous to what "PersonaGym" might imply (e.g., creating detailed persona cards, using evaluation rubrics for persona adherence).
*   **Q4.D.5 (Dynamic Context Injection):** How can the system *dynamically* decide the amount and type of context (from persistent or semantic memory) to inject? What are practical strategies or heuristics for this (e.g., based on conversation length, topic shifts, user confusion signals)?
*   **Q4.D.6 (Common Pitfalls - Specific to AI-Babe Persona):** While general prompt engineering best practices are useful, identifying common pitfalls specifically related to maintaining a "flirty, smart, caring" persona and how to avoid them through prompt design would be beneficial.

### E. TASK 5 — Chat Frontend Error Handling & UX
*   **Q5.E.3 (Response Streaming Libraries/Best Practices for Next.js):** Query 6 touched on streaming. More specific best practices or recommended libraries/hooks for handling SSE or other streaming mechanisms from Next.js API routes to a React frontend, including error handling *within the stream itself* (e.g., if a chunk fails or the stream terminates unexpectedly) are needed.
*   **Q5.E.5 (Frontend State Management for Chat):** While general state management is a broad topic, specific patterns or recommendations for using Zustand, Redux, or React Context to manage complex chat states (pending messages, individual message error states, streamed content, connection status) efficiently would be valuable.

## III. Cross-Cutting & Orchestration Gaps
*   **Q6.1 (Performance Bottlenecks on Vercel):** Identifying potential performance bottlenecks when all these systems are integrated on Vercel (e.g., multiple DB calls, embedding generation latency, LLM call latency within a single API route) and mitigation strategies.
*   **Q6.2 (Achieving <500 LOC Modules):** Practical architectural patterns (beyond general "separation of concerns") for Next.js/Vercel that help achieve the <500 LOC per module requirement for these complex, interconnected features. Examples of how to break down, for instance, the RAG pipeline or the persistent memory access layer into smaller, testable API routes or helper modules.
*   **Q6.3 (Integration Testing on Vercel):** Effective strategies for integration testing these interconnected services (chat API, memory DB, vector DB) in a Vercel deployment environment. How to mock or manage these dependencies during tests?
*   **Q6.4 (Critical Interfaces/Data Contracts):** Defining the specific data contracts and API signatures between the frontend, Next.js backend API routes, and the various backend services (persistent DB, vector DB, LLM) to enable parallel development as per orchestration notes.
*   **Q6.5 (Holistic Data Security):** While individual components have security considerations, a holistic view of data security across the entire proposed architecture (data flow from frontend through Next.js to all backend stores and LLMs) needs to be addressed, including specific Vercel environment variable management for multiple API keys/credentials.

*(This list will be refined and updated as targeted research proceeds.)*