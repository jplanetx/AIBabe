import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

export const dynamic = 'force-dynamic';

/**
 * GET handler: Fetch the user’s profile based on the session.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler: Create the user's profile if it does not exist.
 * This is the route tested in app/api/user/profile/route.test.ts
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (existingProfile) {
      // Profile already exists, perhaps due to a retry or concurrent request.
      // Log this and return success, as the desired state (profile exists) is met.
      console.log(`Profile for user ${userId} already exists. Skipping creation.`);
      return NextResponse.json(existingProfile, { status: 200 });
    }

    const newProfile = await prisma.profile.create({
      data: {
        id: userId,
        email: email,
      },
    });

    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to create profile', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create profile', details: 'An unknown error occurred' }, { status: 500 });
  }
}
