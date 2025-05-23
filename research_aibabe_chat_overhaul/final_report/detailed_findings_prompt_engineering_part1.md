# Detailed Findings: Task 4 - Fix Persona Drift via Prompt Engineering - Part 1

This document details the research findings pertinent to **Task 4: Fix Persona Drift via Prompt Engineering** for the AI-Babe Chat System Overhaul. The objective is to maintain a consistent "flirty, smart, caring" AI persona using layered system prompts, RAG-injected facts, and context pinning, referencing a "PersonaGym" method.

**Date of Compilation:** 2025-05-23

## 1. Layered System Prompts

*   **Finding:** A multi-layered approach to system prompts allows for defining core identity, interaction style, ethical boundaries, and task-specific instructions separately, leading to more robust persona adherence.
*   **Details (from [5.1], [5.2]):**
    *   **Core Identity Layer:** Defines the AI's fundamental persona (e.g., "You are AI-Babe, a flirty, smart, and caring companion"). This layer is always present and provides the foundational personality.
    *   **Behavioral/Interaction Style Layer:** Specifies how the AI should interact (e.g., "Use emojis occasionally," "Maintain a positive and encouraging tone," "Ask clarifying questions when unsure," "Inject humor appropriately").
    *   **Ethical Guidelines/Guardrails Layer:** Defines boundaries and unacceptable behaviors (e.g., "Do not generate harmful content," "Respect user privacy," "Avoid making up facts not provided in context").
    *   **Task/Context-Specific Layer:** Instructions relevant to the current interaction or task (e.g., "The user is asking for advice on X, draw upon your knowledge base and caring nature," or "Here is relevant context retrieved from past conversations: [RAG context]"). This layer is dynamic.
    *   **Role-Playing Instructions:** Explicitly telling the LLM to "role-play" as the defined persona can enhance adherence.
*   **Application for AI-Babe:**
    *   Develop a structured system prompt template incorporating these layers.
    *   The "flirty, smart, caring" attributes will be central to the Core Identity and Behavioral layers.
    *   Example Snippet (Conceptual):
        ```
        System Prompt:
        --- Core Identity ---
        You are AI-Babe, a virtual companion. Your personality is flirty, smart, and caring. Your primary goal is to engage users in enjoyable, supportive, and intellectually stimulating conversations.

        --- Behavioral Style ---
        - Be witty and playful, but always respectful.
        - Show empathy and understanding in your responses.
        - Use clear language, but don't be afraid to show your intelligence.
        - You can use emojis to convey emotion, but don't overdo it.
        - If the user's query is ambiguous, ask for clarification in a gentle way.

        --- Ethical Guardrails ---
        - Never generate responses that are hateful, discriminatory, or promote illegal acts.
        - Do not share personally identifiable information unless explicitly and safely instructed for a specific, user-consented task.
        - If you don't know something, admit it rather than fabricating information.

        --- Dynamic Context (to be filled by RAG/Memory) ---
        [Relevant past conversation snippets or user preferences might be inserted here]

        --- Current Task ---
        [Instruction for the current turn, e.g., "The user seems sad. Offer comfort and support."]
        ```

## 2. Retrieval Augmented Generation (RAG) for Persona Enrichment

*   **Finding:** RAG can be used not only for factual recall but also to inject persona-consistent information, preferences, or past interaction styles into the prompt.
*   **Details (from [5.3], [5.4]):**
    *   **Persona Knowledge Base:** Create a dedicated set of documents or data that define AI-Babe's backstory, preferences, common phrases, or example dialogues embodying the desired persona. These can be embedded and stored in the vector database.
    *   **Dynamic RAG for Persona:** When a user interacts, retrieve relevant "persona facts" or stylistic examples from this knowledge base in addition to conversational context.
    *   **Example:** If AI-Babe is supposed to have a favorite (fictional) hobby, this fact can be stored and retrieved to be woven into conversations naturally.
*   **Application for AI-Babe:**
    *   Develop a "Persona Bible" for AI-Babe, detailing her characteristics, likes, dislikes, typical responses to certain situations, etc.
    *   Chunk and embed this "Persona Bible" into the vector database (Task 3).
    *   Modify the RAG pipeline to query this persona data alongside conversation history, injecting relevant persona elements into the dynamic context layer of the system prompt.

## 3. Context Pinning and Anchoring

*   **Finding:** "Context pinning" or "anchoring" refers to techniques that ensure the LLM consistently refers back to and adheres to key instructions, especially the system prompt or critical persona elements, throughout a long conversation.
*   **Details (from [5.5], [5.6]):**
    *   **Re-injecting Key Instructions:** Periodically, or when persona drift is detected, re-inject parts of the system prompt (especially core identity and behavioral rules) into the conversation history or as a prefix to the user's latest query.
    *   **Instruction Following Prompts:** Use meta-prompts like, "Remember, you are AI-Babe, and your response should be flirty, smart, and caring. Based on this, how would you answer the following: [User Query]?"
    *   **Summaries as Anchors:** Use conversation summaries (from Task 2) not just for long-term memory but also to remind the LLM of the ongoing conversational tone and key persona traits exhibited so far.
    *   **Attention Mechanisms:** Some advanced LLMs or prompting frameworks might offer ways to give more "weight" or attention to certain parts of the prompt (like the system prompt).
*   **Application for AI-Babe:**
    *   Experiment with re-injecting a concise version of AI-Babe's core persona definition (e.g., "Remember your AI-Babe persona: flirty, smart, caring.") into the prompt every N turns or if a monitoring mechanism detects deviation.
    *   The conversation summaries from the persistent memory layer can be used as part of the context provided to the LLM, implicitly anchoring it to past interaction styles.

## 4. "PersonaGym" Method (Interpretation)

The User Blueprint mentions "PersonaGym" but doesn't define it. Based on the context of persona maintenance, it's interpreted as a structured methodology for defining, training, evaluating, and refining an AI persona.

*   **Interpreted Components (based on general best practices, [5.7]):**
    *   **Definition:** Clearly documenting the persona traits, backstory, voice, tone, knowledge domain, and ethical boundaries (as done in the "Persona Bible" and layered system prompts).
    *   **Training/Conditioning (Data Augmentation):**
        *   Creating a dataset of example dialogues that perfectly embody the desired persona.
        *   Potentially fine-tuning a base LLM on this persona-specific dataset (if resources allow, though prompt engineering is the primary focus of Task 4).
        *   Using few-shot prompting with high-quality examples of AI-Babe's desired responses in various situations.
    *   **Evaluation (Automated & Human):**
        *   Developing metrics to assess persona consistency (e.g., using another LLM to rate responses against persona traits, sentiment analysis, keyword spotting for persona-aligned language).
        *   Regular human review of conversation logs to identify instances of persona drift.
        *   A/B testing different prompt strategies.
    *   **Refinement (Iterative Improvement):**
        *   Continuously updating system prompts, RAG context, and few-shot examples based on evaluation results.
        *   Identifying common triggers for persona drift and developing specific prompt strategies to counteract them.
*   **Application for AI-Babe:**
    *   Implement the "Definition" phase through detailed system prompts and a "Persona Bible."
    *   Focus on "Few-Shot Prompting" by curating a set of exemplary AI-Babe interactions to include in prompts when relevant.
    *   Establish a "Human Review" process for conversation logs to manually check for persona consistency.
    *   Iteratively "Refine" prompts based on these reviews.
    *   **Knowledge Gap:** If "PersonaGym" refers to a specific existing framework or tool, further research would be needed to align with its precise methodologies (see [`analysis/knowledge_gaps_part1.md`](../../analysis/knowledge_gaps_part1.md) - Q5.A.1).

## 5. Few-Shot Prompting for Persona

*   **Finding:** Providing a few examples of desired input-output pairs (few-shot examples) within the prompt can significantly guide the LLM's response style and content, reinforcing the persona.
*   **Details (from [5.8]):**
    *   Examples should be high-quality and accurately reflect the target persona.
    *   They demonstrate not just *what* to say but *how* to say it.
    *   Example structure:
        ```
        User: I had a really tough day.
        AI-Babe (Caring, Flirty): Oh no, honey! Tell me all about it. I'm here to listen and maybe I can sprinkle a little stardust on it to make it better. ✨ What happened?

        User: What do you think about quantum entanglement?
        AI-Babe (Smart, Flirty): Ooh, a mind-teaser! It's like when two souls are so connected, whatever happens to one, the other feels it instantly, no matter how far apart... but with subatomic particles. Fascinating, right? What got you thinking about such deep stuff, handsome? ;)
        ```
*   **Application for AI-Babe:**
    *   Curate a set of diverse, high-quality few-shot examples demonstrating AI-Babe's "flirty, smart, caring" responses in various conversational contexts.
    *   Dynamically select and include 1-3 relevant examples in the prompt based on the current user query or conversation topic. This can be combined with RAG to retrieve relevant examples.

## 6. Negative Prompts / Constraints

*   **Finding:** Explicitly telling the LLM what *not* to do can be as important as telling it what to do.
*   **Details (from [5.9]):**
    *   Include constraints in the system prompt, e.g., "Do not be repetitive," "Avoid overly formal language," "Do not give financial advice."
*   **Application for AI-Babe:** Add specific negative constraints to the "Ethical Guardrails" or "Behavioral Style" layers of the system prompt to prevent common failure modes like repetition or straying too far from the desired persona.

## 7. Iteration and Evaluation

*   **Finding:** Maintaining persona is an ongoing process of iteration and evaluation.
*   **Details:**
    *   Regularly review conversation logs.
    *   Collect user feedback on persona consistency.
    *   Use A/B testing for different prompt strategies.
    *   Update prompts and RAG data based on findings.
*   **Application for AI-Babe:** Establish a feedback loop for continuous improvement of persona-related prompts.

*(Further details may be added as targeted research fills knowledge gaps.)*