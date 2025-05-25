import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Get a specific character
      const character = await prisma.character.findUnique({
        where: {
          id,
        },
      });

      if (!character) {
        return NextResponse.json(
          { error: "Character not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ character });
    } else {
      // Get all characters
      const characters = await prisma.character.findMany({
        orderBy: {
          name: "asc",
        },
      });

      return NextResponse.json({ characters });
    }
  } catch (error) {
    console.error("Error fetching characters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, personality, description, image, coverImage, bio, interests, favoriteQuote } = await req.json();

    if (!name || !personality || !description || !image || !bio) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const character = await prisma.character.create({
      data: {
        name,
        personality,
        description,
        image,
        coverImage,
        bio,
        interests,
        favoriteQuote,
      },
    });

    return NextResponse.json({ character });
  } catch (error) {
    console.error("Error creating character:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
