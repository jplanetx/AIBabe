import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const messages = await db.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, isUserMessage, userId, girlfriendId, conversationId } = body;

    if (!content || userId === undefined || !girlfriendId || !conversationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check user's subscription and message limits
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check message limits based on subscription plan
    if (isUserMessage) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const messageCount = await db.message.count({
        where: {
          userId,
          isUserMessage: true,
          createdAt: {
            gte: today,
          },
        },
      });

      const FREE_TIER_LIMIT = 15;
      const BASIC_TIER_LIMIT = 150;

      if (
        (user.subscription?.plan === "FREE" && messageCount >= FREE_TIER_LIMIT) ||
        (user.subscription?.plan === "BASIC" && messageCount >= BASIC_TIER_LIMIT)
      ) {
        return NextResponse.json(
          { error: "Message limit reached for your subscription plan" },
          { status: 403 }
        );
      }
    }

    // Create message
    const message = await db.message.create({
      data: {
        content,
        isUserMessage,
        userId,
        girlfriendId,
        conversationId,
      },
    });

    // If it's a user message, extract potential memories
    if (isUserMessage) {
      // Simple memory extraction logic - in a real app, this would be more sophisticated
      const keywords = ["favorite", "like", "love", "hate", "enjoy", "birthday", "name", "live"];
      
      for (const keyword of keywords) {
        if (content.toLowerCase().includes(keyword)) {
          await db.memory.create({
            data: {
              content,
              importance: 3, // Medium importance
              conversationId,
            },
          });
          break; // Only create one memory per message
        }
      }
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}