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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session:", sessionError);
      return NextResponse.json({ error: "Internal server error during session retrieval" }, { status: 500 });
    }
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const basicUser = await db.user.findUnique({
      where: {
        id: session.user.id,
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
        userId: session.user.id,
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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session for POST:", sessionError);
      return NextResponse.json({ error: "Internal server error during session retrieval" }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Assuming userId and email for the new profile might come from the request body
    // or could be derived from the session. For this example, let's assume they come from the body
    // AND we ensure the operation is authorized by the current session user.
    const body = await request.json();
    const { userId, email } = body; // Make sure these are validated and correspond to the session user if necessary

    // It's crucial to ensure that the user making the request is authorized to create/update this profile.
    // For example, userId from body should match session.user.id
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You can only create your own profile." }, { status: 403 });
    }

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
    }

    // Check if profile already exists
const existingProfile = await db.profile.findUnique({
      where: { id: userId },
    });

    if (existingProfile) {
      // Profile already exists, perhaps due to a retry or concurrent request.
      // Log this and return success, as the desired state (profile exists) is met.
      console.log(`Profile for user ${userId} already exists. Skipping creation.`);
      return NextResponse.json(existingProfile, { status: 200 });
    }

    const newProfile = await db.profile.create({
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
