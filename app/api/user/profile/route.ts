import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Assuming this is the correct client
import { z } from 'zod';
import { db } from '@/lib/db'; // Assuming this is the correct Prisma client import

export const dynamic = 'force-dynamic';

const profileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name cannot be empty' }).optional(),
  lastName: z.string().min(1, { message: 'Last name cannot be empty' }).optional(),
  bio: z.string().optional(),
}).strict({ message: 'Unexpected fields in request body' });

export async function POST(request: NextRequest) {
  try {
    // const cookieStore = cookies(); // This will be awaited inside the handlers
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            const cookieStore = await cookies();
            cookieStore.set(name, value, options);
          },
          async remove(name: string, options: CookieOptions) {
            const cookieStore = await cookies();
            cookieStore.set(name, '', options);
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Error fetching user or no user authenticated:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body: Not JSON' }, { status: 400 });
    }

    const validationResult = profileSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const validatedProfileData = validationResult.data;

    // Ensure a User record exists
    let prismaUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!prismaUser) {
      prismaUser = await db.user.create({
        data: {
          id: user.id,
          email: user.email, // Store email if available, good for reference
        },
      });
    }

    // Create or update UserProfile
    // The UserProfile model stores profile data as a JSON string in the 'profileData' field.
    const profileDataString = JSON.stringify(validatedProfileData);

    const userProfile = await db.userProfile.upsert({
      where: { userId: user.id },
      update: {
        profileData: profileDataString,
        lastUpdated: new Date(), // Explicitly update lastUpdated timestamp
      },
      create: {
        userId: user.id,
        profileData: profileDataString,
      },
    });

    // It might be better to return the parsed profile data instead of the whole userProfile object
    // which includes the stringified version. For now, returning as is.
    return NextResponse.json({ message: 'Profile created/updated successfully', profile: validatedProfileData }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/user/profile:', error);
    if (error instanceof z.ZodError) { // Should be caught by safeParse, but as a safeguard
        return NextResponse.json({ error: 'Invalid request body format.', details: error.flatten().fieldErrors }, { status: 400 });
    }
    // Consider more specific error handling for Prisma errors if needed
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
