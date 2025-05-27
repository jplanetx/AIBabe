export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * GET handler: Fetch the user’s profile based on the session.
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting user or no user:", authError);
      return NextResponse.json({ error: "Internal server error during session retrieval" }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const basicUser = await db.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        subscription: true,
      },
    });

    if (!basicUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch UserProfile separately
    const userProfile = await db.userProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    // Combine user and userProfile data
    const userWithProfile = {
      ...basicUser,
      userProfile: userProfile || null, // Attach profile or null if not found
    };

    return NextResponse.json(userWithProfile);
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
export async function POST(request: NextRequest) { // Changed Request to NextRequest
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting user for POST or no user:", authError);
      return NextResponse.json({ error: "Internal server error during user retrieval or user not found" }, { status: 500 });
    }

    const body = await request.json();
    // Assuming the body directly contains the preferences payload for `profileData`
    // and potentially other fields for UserProfile.
    // For simplicity, let's assume `body` is the object to be stored in `profileData`.

    const userId = user.id; // Use the authenticated user's ID

    // Check if UserProfile already exists
    const existingUserProfile = await db.userProfile.findUnique({
      where: { userId: userId },
    });

    if (existingUserProfile) {
      // UserProfile exists, update it
      const updatedUserProfile = await db.userProfile.update({
        where: { userId: userId },
        data: {
          profileData: JSON.stringify(body), // Store the entire body as a JSON string
          lastUpdated: new Date(),
          // Potentially update confidenceScore or other fields if applicable
        },
      });
      console.log(`UserProfile for user ${userId} updated.`);
      return NextResponse.json(updatedUserProfile, { status: 200 });
    } else {
      // UserProfile does not exist, create it
      const newUserProfile = await db.userProfile.create({
        data: {
          userId: userId,
          profileData: JSON.stringify(body), // Store the entire body as a JSON string
          // Set default confidenceScore or other initial values if needed
        },
      });
      console.log(`UserProfile for user ${userId} created.`);
      return NextResponse.json(newUserProfile, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating UserProfile:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to create profile', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create profile', details: 'An unknown error occurred' }, { status: 500 });
  }
}
