import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  // Add any other fields you expect during registration, e.g., name
  // name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
}).strict({ message: 'Unexpected fields in request' });

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
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

  const { email, password } = validationResult.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo: `${request.nextUrl.origin}/auth/callback`, // Optional: if you have email confirmation
    },
  });

  if (error) {
    console.error('Supabase sign up error:', error);
    return NextResponse.json({ error: error.message || 'Could not sign up user' }, { status: error.status || 500 });
  }

  if (!data.session && data.user?.identities?.length === 0) {
     return NextResponse.json({ error: 'User already exists or another issue occurred.' }, { status: 409 });
  }


  // If sign up is successful, Supabase sends a confirmation email if enabled.
  // The session might not be immediately available; it's set after email confirmation or if auto-confirm is on.
  return NextResponse.json({ message: 'Registration successful. Please check your email to confirm your account.', user: data.user }, { status: 201 });
}