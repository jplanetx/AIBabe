import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const characterId = searchParams.get("characterId");

    if (!userId || !characterId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const memories = await prisma.memory.findMany({
      where: {
        userId,
        characterId,
      },
      orderBy: [
        {
          importance: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
    });

    return NextResponse.json({ memories });
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, characterId, content, importance = 1 } = await req.json();

    if (!userId || !characterId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const memory = await prisma.memory.create({
      data: {
        userId,
        characterId,
        content,
        importance,
      },
    });

    return NextResponse.json({ memory });
  } catch (error) {
    console.error("Error creating memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, content, importance } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing memory ID" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (importance !== undefined) updateData.importance = importance;

    const memory = await prisma.memory.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json({ memory });
  } catch (error) {
    console.error("Error updating memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing memory ID" },
        { status: 400 }
      );
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}