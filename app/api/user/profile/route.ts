import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Use the shared Prisma client

// const prisma = new PrismaClient(); // Remove local instantiation

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
    }

    // Check if profile already exists
    const existingProfile = await db.profile.findUnique({ // Use db instead of prisma
      where: { id: userId },
    });

    if (existingProfile) {
      // Profile already exists, perhaps due to a retry or concurrent request.
      // Log this and return success, as the desired state (profile exists) is met.
      console.log(`Profile for user ${userId} already exists. Skipping creation.`);
      return NextResponse.json(existingProfile, { status: 200 });
    }

    const newProfile = await db.profile.create({ // Use db instead of prisma
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
  } // finally { // No longer need to disconnect the shared client here
    // await db.$disconnect();
  // }
}