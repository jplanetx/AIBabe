export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const conversations = await db.conversation.findMany({
      where: {
        userId,
      },
      include: {
        girlfriend: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          take: 10,
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, girlfriendId } = body;

    if (!userId || !girlfriendId) {
      return NextResponse.json(
        { error: "User ID and Girlfriend ID are required" },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await db.conversation.findFirst({
      where: {
        userId,
        girlfriendId,
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await db.conversation.create({
      data: {
        userId,
        girlfriendId,
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}