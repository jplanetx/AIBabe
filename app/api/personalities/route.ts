export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const personalities = await prisma.personality.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(personalities);
  } catch (error) {
    console.error("Error fetching personalities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, type, description, imageUrl, greeting } = await req.json();

    if (!name || !type || !description || !imageUrl || !greeting) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const personality = await prisma.personality.create({
      data: {
        name,
        type,
        description,
        imageUrl,
        greeting,
      },
    });

    return NextResponse.json(personality, { status: 201 });
  } catch (error) {
    console.error("Error creating personality:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
