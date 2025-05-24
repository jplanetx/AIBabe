import { createBrowserClient } from '@supabase/ssr';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers'; // Import cookies from next/headers for server components

// For client-side components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// For server-side components and route handlers
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// For server-side Route Handlers and Server Actions (alternative, if not using the one above directly)
// This provides a more direct way to get a server client within API routes or Server Actions
// if you prefer to pass cookies explicitly.
export function createSupabaseRouteHandlerClient() {
    const cookieStore = cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                // If you are developing Server Components and Server Actions, you need to
                // pass the cookies() store from next/headers to createServerComponentClient.
                // Server Components:
                // cookies: {
                //   get(name: string) {
                //     return cookieStore.get(name)?.value
                //   },
                // },
                // Server Actions:
                // cookies: {
                //   get(name: string) {
                //     return cookieStore.get(name)?.value
                //   },
                //   set(name: string, value: string, options: CookieOptions) {
                //     cookieStore.set({ name, value, ...options })
                //   },
                //   remove(name: string, options: CookieOptions) {
                //     cookieStore.set({ name, value: '', ...options })
                //   },
                // },
            },
        }
    )
}

console.log('Supabase clients (client-side and server-side) initialized in lib/supabaseClients.ts');