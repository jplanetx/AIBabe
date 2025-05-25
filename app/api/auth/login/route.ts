export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from "@/lib/db";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password cannot be empty' }), // Basic check, Supabase handles complexity
}).strict({ message: 'Unexpected fields in request' });

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
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

  const validationResult = loginSchema.safeParse(jsonData);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password } = validationResult.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase sign in error:', error);
    // It's important to return a generic error message for failed login attempts
    // to avoid leaking information about whether an email address is registered.
    return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
  }

  // On successful login, Supabase client automatically handles setting the session cookie
  // via the cookie helpers provided to createServerClient.
  return NextResponse.json({ message: 'Login successful', user: data.user, session: data.session }, { status: 200 });
}
