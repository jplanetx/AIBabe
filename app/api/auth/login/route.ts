export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password cannot be empty' }), // Supabase handles password complexity on its end
}).strict({ message: 'Unexpected fields in request' });

export async function POST(request: NextRequest) {
  try {
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
            try {
              const cookieStore = await cookies();
              cookieStore.set(name, value, options);
            } catch (error) {
              console.error('Failed to set cookie:', name, error);
            }
          },
          async remove(name: string, options: CookieOptions) {
            try {
              const cookieStore = await cookies();
              cookieStore.set(name, '', options);
            } catch (error) {
              console.error('Failed to remove cookie:', name, error);
            }
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
      console.error('Supabase sign in error:', error.message, error.status);
      // Check if it's a Supabase AuthError with a status code
      if (typeof error.status === 'number') {
        if (error.status >= 500) {
          // Supabase server error
          return NextResponse.json({ error: 'Login failed due to an external service error. Please try again later.' }, { status: 500 });
        } else if (error.status === 401 || error.status === 400 ) {
          // Invalid credentials or bad request to Supabase
          return NextResponse.json({ error: error.message || 'Invalid login credentials' }, { status: error.status });
        } else if (error.status === 429) {
          // Rate limited
          return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
        }
        // For other known auth error statuses that are not explicitly handled above
        return NextResponse.json({ error: error.message || 'Login failed.' }, { status: error.status });
      }
      // Fallback for other types of errors or if status is not present
      return NextResponse.json({ error: 'An unexpected error occurred during login.' }, { status: 500 });
    }

    if (!data.user) {
      console.error('Supabase sign in did not return a user nor an error.');
      // This case should ideally be covered by the error handling above if signInWithPassword fails.
      // If it reaches here without an error but no user, it's an unexpected state.
      return NextResponse.json({ error: 'Login failed due to an unexpected issue. Please try again.' }, { status: 500 });
    }

    // If signInWithPassword is successful, createServerClient with the cookie helpers
    // should have automatically handled setting the sb-access-token and sb-refresh-token cookies.

    return NextResponse.json({ message: 'Login successful', user: data.user }, { status: 200 });
  } catch (e) {
    console.error('Unexpected error in login route:', e);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
