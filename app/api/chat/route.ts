import { NextRequest, NextResponse } from "next/server";
// PrismaClient is no longer directly instantiated here, using shared client from lib
import { prisma } from "../../../lib/prisma"; // Adjusted path to shared prisma client
import { getAllUserPreferences, getConversationSummary } from '../../../lib/memory_crud';
import { checkAndTriggerSummary } from '../../../lib/summarizer';
import { triggerVectorIngestionForMessage, queryVectorDB } from '../../../lib/vector_db'; // Added queryVectorDB
import { getLlmResponse } from '../../../lib/llm_service'; // Added getLlmResponse

export const dynamic = "force-dynamic";

// const prisma = new PrismaClient(); // Replaced by shared client import

export async function POST(req: NextRequest) {
  try {
    const { userId, personalityId, message } = await req.json();
    console.log("API_CHAT_REQUEST_RECEIVED:", { userId, personalityId, message });

    if (!userId || !personalityId || !message) {
      const errorResponse = { error_code: "MISSING_FIELDS", message: "Missing required fields (userId, personalityId, message)." };
      console.log("API_CHAT_SENDING_ERROR_RESPONSE (400):", errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check user's subscription and message limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      const errorResponse = { error_code: "USER_NOT_FOUND", message: "User not found." };
      console.log("API_CHAT_SENDING_ERROR_RESPONSE (404):", errorResponse);
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId,
        personalityId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          personalityId,
        },
      });
    }

    // Load user preferences and existing summary
    const userPreferences = await getAllUserPreferences(userId);
    const existingSummary = await getConversationSummary(conversation.id);

    console.log("API_CHAT_USER_PREFERENCES_LOADED:", userPreferences);
    console.log("API_CHAT_EXISTING_SUMMARY_LOADED:", existingSummary);
    // These are not used in the response logic yet, but loaded.

    // Query Vector DB for relevant context
    let relevantContextFromVectorDB: any[] = [];
    if (message && userId && conversation && conversation.id) { // Ensure necessary IDs are available
      console.log("API_CHAT_INFO: Querying Vector DB for relevant context...");
      relevantContextFromVectorDB = await queryVectorDB(message, userId, 3); // Query with user's message
      console.log("API_CHAT_INFO: Retrieved context from Vector DB:", relevantContextFromVectorDB);
    }
    // This 'relevantContextFromVectorDB' can be used later in prompt engineering (TASK 4)

    // Count today's messages
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const messageCount = await prisma.message.count({
      where: {
        conversation: {
          userId,
        },
        sender: "user",
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    const messageLimit = user.subscription?.messageLimit || 15;

    // Check if user has reached their message limit
    if (messageCount >= messageLimit && user.subscription?.plan === "free") {
      return NextResponse.json(
        {
          limitReached: true,
          messageCount,
          messageLimit,
        },
        { status: 200 }
      );
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        isUserMessage: true, // Correct field and type
        content: message,    // Correct field
      },
    });

    // Trigger vector DB ingestion for user message
    if (userMessage && userMessage.id) {
      // Intentionally not awaiting, let it run in background
      triggerVectorIngestionForMessage(userMessage.id)
        .catch(err => console.error("API_CHAT_ERROR: Failed to trigger vector ingestion for user message:", err));
    }

    // Check for potential memory in the message
    if (
      message.includes("my") ||
      message.includes("I") ||
      message.length > 50
    ) {
      if (userMessage && userMessage.id && conversation && conversation.id) { // Ensure userMessage and conversation are defined
        await prisma.memory.create({
          data: {
            key: userMessage.id, // Use message ID as the key for uniqueness
            value: message,       // Store message content in 'value'
            conversationId: conversation.id, // Link to the current conversation
          },
        });
        console.log("API_CHAT_MEMORY_CREATED_WITH_KEY:", userMessage.id);
      } else {
        console.warn("API_CHAT_MEMORY_CREATION_SKIPPED: userMessage.id or conversation.id is undefined.");
      }
    }

    // Get personality details
    const personality = await prisma.personality.findUnique({
      where: { id: personalityId },
    });

    if (!personality) {
      const errorResponse = { error_code: "PERSONALITY_NOT_FOUND", message: "Personality not found." };
      console.log("API_CHAT_SENDING_ERROR_RESPONSE (404):", errorResponse);
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Get random memory to reference (30% chance)
    let memoryReference = null;
    if (Math.random() > 0.7 && conversation && conversation.id) { // Ensure conversation object is defined
      const memories = await prisma.memory.findMany({
        where: { conversationId: conversation.id }, // Query by conversationId
        orderBy: { createdAt: "desc" }, // Order by creation time (or any other relevant field like 'updatedAt')
        take: 5,
      });
      console.log("API_CHAT_MEMORIES_FOUND:", memories.length > 0 ? memories : "No memories found for this conversation.");

      if (memories.length > 0) {
        memoryReference =
          memories[Math.floor(Math.random() * memories.length)];
      }
    }

    // --- Start New Prompt Assembly ---
    let promptParts = [];

    // 1. Core Persona Prompt
    if (personality) {
      promptParts.push(`You are ${personality.name}, ${personality.description}. Your defined personality is: "${personality.personality}". Act consistently with this persona.`);
    }

    // 2. User Preferences
    if (userPreferences && userPreferences.length > 0) {
      promptParts.push("\n--- User Preferences ---");
      userPreferences.forEach(pref => {
        promptParts.push(`${pref.key}: ${pref.value}`);
      });
    }

    // 3. Conversation Summary
    if (existingSummary && existingSummary.summary) {
      promptParts.push("\n--- Conversation Summary ---");
      promptParts.push(existingSummary.summary);
    }
    
    // 4. RAG Context from Vector DB
    if (relevantContextFromVectorDB && relevantContextFromVectorDB.length > 0) {
      promptParts.push("\n--- Relevant Past Interactions (from VectorDB) ---");
      relevantContextFromVectorDB.forEach((item: any, index: number) => {
        promptParts.push(`Context ${index + 1} (Similarity: ${item.score?.toFixed(2)}): "${item.text}"`);
      });
    }

    // 5. (Optional) Specific Old Memory Snippet - if still desired
    if (memoryReference && memoryReference.value) {
      promptParts.push("\n--- Highlighted Past Snippet ---");
      promptParts.push(`You also recall this specific past interaction: "${memoryReference.value}"`);
    }

    // 6. Current Conversation History (Simplified for now - just the latest user message)
    promptParts.push("\n--- Current Conversation ---");
    promptParts.push(`User: "${message}"`); // Current user message
    promptParts.push(`AI (Your response):`); // Instruction for the AI

    const assembledPrompt = promptParts.join("\n\n"); // Join parts with double newline for clarity

    console.log("API_CHAT_INFO: Assembled prompt for LLM (full):\n", assembledPrompt);

    // Call the (placeholder) LLM service
    const aiResponse = await getLlmResponse(assembledPrompt);
    // --- End New Prompt Assembly & LLM Call ---

    // Save AI response
    const aiMessageRecord = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        isUserMessage: false, // Correct field and type
        content: aiResponse,  // Correct field
      },
    });
    console.log("API_CHAT_AI_MESSAGE_SAVED:", aiMessageRecord.id);


    // Trigger vector DB ingestion for AI message
    if (aiMessageRecord && aiMessageRecord.id) {
      // Intentionally not awaiting, let it run in background
      triggerVectorIngestionForMessage(aiMessageRecord.id)
        .catch(err => console.error("API_CHAT_ERROR: Failed to trigger vector ingestion for AI message:", err));
    }

    const successResponse = {
      userMessage: userMessage, // This should be the object from prisma.message.create
      aiMessage: aiMessageRecord, // This should be the object from prisma.message.create
      messageCount: messageCount + 1, 
      messageLimit,
    };

    // Check and trigger summary generation
    if (conversation && conversation.id) {
      // Pass the count of all messages in the conversation so far (including the one just saved)
      // The summarizer itself fetches the latest count if needed, or can be passed messageCount + 1
      await checkAndTriggerSummary(conversation.id);
    }

    console.log("API_CHAT_SENDING_SUCCESS_RESPONSE:", successResponse);
    // The return NextResponse.json() was duplicated in previous versions, ensuring only one remains.
    return NextResponse.json(successResponse); 
  } catch (error) {
    console.error("API_CHAT_ERROR_CAUGHT:", error);
    const errorResponse = { error_code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred. Please try again later." };
    console.log("API_CHAT_SENDING_ERROR_RESPONSE (500):", errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}