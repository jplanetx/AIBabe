export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from "@/lib/db";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).optional(), // Made optional for now, can be required
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
}).strict({ message: 'Unexpected fields in request' });

export async function POST(request: NextRequest) {
  const cookieStorePromise = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookieStorePromise;
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookieStorePromise;
          cookieStore.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await cookieStorePromise;
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  let jsonData;
  try {
    jsonData = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body: Not JSON' }, { status: 400 });
  }

  const validationResult = registerSchema.safeParse(jsonData);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = validationResult.data; // Destructure name as well

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo: `${request.nextUrl.origin}/auth/callback`, // Optional: if you have email confirmation
    },
  });

  if (error) {
    console.error('Supabase sign up error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: error.status || 500 });
  }

  if (!data.session && data.user?.identities?.length === 0) {
     return NextResponse.json({ error: 'User already exists or another issue occurred.' }, { status: 409 });
  }

  // If Supabase sign-up was successful and we have a user object
  if (data.user) {
    try {
      // Create a corresponding user in your public User table
      const newUserInDb = await db.user.create({
        data: {
          id: data.user.id, // Use the ID from Supabase Auth
          email: data.user.email,
          name: name, // Use the name from the validated request data
        },
      });
      console.log('User record created in public schema:', newUserInDb);
    } catch (dbError) {
      console.error('Error creating user record in public schema:', dbError);
      // Potentially, you might want to "undo" the Supabase auth user creation here if critical,
      // or log this for manual intervention. For now, we'll return an error.
      // await supabase.auth.admin.deleteUser(data.user.id); // Requires admin privileges
      return NextResponse.json({ error: 'Registration succeeded but failed to create user profile. Please contact support.' }, { status: 500 });
    }
  } else if (!data.session) {
    // This case might indicate that email confirmation is pending.
    // The user object might still be in data.user but without a session.
    // If data.user is null here, it's a more problematic issue.
     console.warn('Supabase signUp returned no session and no user, email confirmation might be pending or an issue occurred.');
     // Depending on your flow (e.g., if email confirmation is enabled and strictly required before DB entry)
     // you might handle this differently. For now, we assume data.user should be present.
     if (!data.user) {
        return NextResponse.json({ error: 'Registration initiated but user data not available post-signup.' }, { status: 500 });
     }
      // If email confirmation is on, you might not create the public.User record here,
      // but rather after the user confirms their email (e.g., in an /auth/callback route).
      // For simplicity, if auto-confirm is off, this flow assumes the public.User is created immediately.
  }


  // If sign up is successful, Supabase sends a confirmation email if enabled.
  // The session might not be immediately available; it's set after email confirmation or if auto-confirm is on.
  return NextResponse.json({ message: 'Registration successful. Please check your email to confirm your account.', user: data.user }, { status: 201 });
}
