// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  console.log('Middleware invoked for path:', request.nextUrl.pathname);
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client for server-side operations
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request and response cookies.
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request and response cookies.
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Attempt to get the session
  const { data: { session } } = await supabase.auth.getSession();

  console.log('Middleware: Supabase session check (placeholder). Current session:', session ? 'Exists' : 'Does not exist');

  // --- Placeholder Authentication Logic ---
  // This is where you would implement your actual authentication checks.
  // For now, it allows all requests but logs the session status.

  const protectedPaths = ['/dashboard', '/chat', '/api/user/profile']; // Add other paths that need protection
  const currentPath = request.nextUrl.pathname;

  if (protectedPaths.some(path => currentPath.startsWith(path))) {
    if (!session) {
      console.log(`Middleware: Access to protected route ${currentPath} denied. Redirecting to login.`);
      // If no session and trying to access a protected route, redirect to login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.search = ''; // Clear any existing search params before setting new ones, if any
      // Optionally, add a redirect query parameter: redirectUrl.searchParams.set('redirectedFrom', currentPath);
      return NextResponse.redirect(redirectUrl); // NextResponse.redirect can handle a URL object
    }
    console.log(`Middleware: Access to protected route ${currentPath} allowed.`);
  } else {
    console.log(`Middleware: Path ${currentPath} is not a protected route or session exists. Allowing request.`);
  }
  
  // --- End Placeholder ---

  console.log('Middleware: Placeholder logic complete. Proceeding with request.');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/.*).*)',
    // Explicitly include API routes if needed, or adjust the negative lookahead
    // '/api/:path*', // This would match all /api routes
  ],
};