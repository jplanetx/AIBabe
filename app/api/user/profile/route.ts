import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
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
  } finally {
    await prisma.$disconnect();
  }
}