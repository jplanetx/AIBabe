export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const updatePasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: z.string(),
}).strict({ message: 'Unexpected fields in request' }).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

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

  const validationResult = updatePasswordSchema.safeParse(jsonData);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { password } = validationResult.data;

  try {
    // Check if user is authenticated (should have valid session from reset link)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Invalid or expired reset link. Please request a new password reset.' 
      }, { status: 401 });
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error('Supabase update password error:', error);
      return NextResponse.json({ 
        error: 'Failed to update password. Please try again.' 
      }, { status: error.status || 500 });
    }

    return NextResponse.json({ 
      message: 'Password updated successfully. You can now log in with your new password.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error during password update:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
}
