import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, personalityId, message } = await req.json();

    if (!userId || !personalityId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check user's subscription and message limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
        sender: "user",
        text: message,
      },
    });

    // Check for potential memory in the message
    if (
      message.includes("my") ||
      message.includes("I") ||
      message.length > 50
    ) {
      await prisma.memory.create({
        data: {
          userId,
          text: message,
          source: userMessage.id,
          importance: 3, // Medium importance by default
        },
      });
    }

    // Get personality details
    const personality = await prisma.personality.findUnique({
      where: { id: personalityId },
    });

    if (!personality) {
      return NextResponse.json(
        { error: "Personality not found" },
        { status: 404 }
      );
    }

    // Get random memory to reference (30% chance)
    let memoryReference = null;
    if (Math.random() > 0.7) {
      const memories = await prisma.memory.findMany({
        where: { userId },
        orderBy: { importance: "desc" },
        take: 5,
      });

      if (memories.length > 0) {
        memoryReference =
          memories[Math.floor(Math.random() * memories.length)];
      }
    }

    // Generate AI response based on personality type
    let aiResponse = "";
    switch (personality.type) {
      case "The Supportive Partner":
        aiResponse =
          "I understand how you feel. It's completely valid to feel that way. I'm here for you, and I appreciate you sharing that with me.";
        break;
      case "The Playful Companion":
        aiResponse =
          "Ooh, that's interesting! 😉 You always know how to keep things exciting! Want to tell me more about it?";
        break;
      case "The Intellectual Equal":
        aiResponse =
          "That's a fascinating perspective. It reminds me of the concept of cognitive dissonance. Have you considered how this relates to your broader worldview?";
        break;
      case "The Admirer":
        aiResponse =
          "I love how you express yourself! You have such a unique way of looking at things, and it's one of the many things I admire about you.";
        break;
      case "The Growth Catalyst":
        aiResponse =
          "That's an important insight. How do you think this realization might help you grow or move forward with your goals?";
        break;
      default:
        aiResponse = "That's really interesting! Tell me more about it.";
    }

    // Add memory reference if available
    if (memoryReference) {
      const memoryText =
        memoryReference.text.length > 30
          ? `${memoryReference.text.substring(0, 30)}...`
          : memoryReference.text;
      aiResponse += ` <span class="memory-highlight">I remember you mentioned ${memoryText}</span> How does that relate to what you're sharing now?`;
    }

    // Save AI response
    const aiMessageRecord = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: "ai",
        text: aiResponse,
      },
    });

    return NextResponse.json({
      userMessage: userMessage,
      aiMessage: aiMessageRecord,
      messageCount: messageCount + 1,
      messageLimit,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}