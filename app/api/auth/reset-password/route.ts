export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
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

  const validationResult = resetPasswordSchema.safeParse(jsonData);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email } = validationResult.data;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.nextUrl.origin}/auth/reset-password/confirm`,
    });

    if (error) {
      console.error('Supabase reset password error:', error);
      return NextResponse.json({ error: 'Failed to send reset email. Please try again.' }, { status: error.status || 500 });
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({ 
      message: 'If an account with that email exists, we have sent a password reset link.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error during password reset:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
