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

    const memories = await db.memory.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        importance: "desc",
      },
    });

    return NextResponse.json(memories);
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json(
      { error: "Failed to fetch memories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, importance, conversationId } = body;

    if (!content || !conversationId) {
      return NextResponse.json(
        { error: "Content and Conversation ID are required" },
        { status: 400 }
      );
    }

    const memory = await db.memory.create({
      data: {
        content,
        importance: importance || 1,
        conversationId,
      },
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error("Error creating memory:", error);
    return NextResponse.json(
      { error: "Failed to create memory" },
      { status: 500 }
    );
  }
}