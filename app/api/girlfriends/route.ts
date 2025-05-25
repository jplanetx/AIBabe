export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const girlfriends = await db.girlfriend.findMany();
    return NextResponse.json(girlfriends);
  } catch (error) {
    console.error("Error fetching girlfriends:", error);
    return NextResponse.json(
      { error: "Failed to fetch girlfriends" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, personality, imageUrl, traits, interests } = body;

    if (!name || !description || !personality || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const girlfriend = await db.girlfriend.create({
      data: {
        name,
        description,
        personality,
        imageUrl,
        traits: traits || [],
        interests: interests || [],
      },
    });

    return NextResponse.json(girlfriend, { status: 201 });
  } catch (error) {
    console.error("Error creating girlfriend:", error);
    return NextResponse.json(
      { error: "Failed to create girlfriend" },
      { status: 500 }
    );
  }
}