/**
 * @jest-environment node
 */
import { middleware } from './middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Mock next/headers
const mockMiddlewareCookieStore = new Map<string, string>();
jest.mock('next/headers', () => {
  const originalModule = jest.requireActual('next/headers');
  return {
    ...originalModule,
    cookies: jest.fn(() => ({
      get: jest.fn((name: string) => {
        const value = mockMiddlewareCookieStore.get(name);
        return value !== undefined ? { name, value } : undefined;
      }),
      set: jest.fn((nameOrOptions: string | any, value?: string) => {
        if (typeof nameOrOptions === 'string') {
          mockMiddlewareCookieStore.set(nameOrOptions, value || '');
        } else {
          mockMiddlewareCookieStore.set(nameOrOptions.name, nameOrOptions.value);
        }
      }),
      delete: jest.fn((name: string) => {
        mockMiddlewareCookieStore.delete(name);
      }),
      has: jest.fn((name: string) => mockMiddlewareCookieStore.has(name)),
      getAll: jest.fn(() => Array.from(mockMiddlewareCookieStore.entries()).map(([name, value]) => ({ name, value }))),
    })),
  };
});

// Mock Supabase client from @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(), // Will be configured in beforeEach
}));

// Mock NextRequest and NextResponse
const mockNextRequest = (pathname: string, cookieHeaderValue: string = ''): NextRequest => {
  const url = `http://localhost:3000${pathname}`;
  const headers = new Headers();
  if (cookieHeaderValue) {
    headers.set('Cookie', cookieHeaderValue);
  }
  // Ensure the URL is valid, especially if pathname doesn't start with /
  const finalUrl = new URL(pathname, 'http://localhost:3000').toString();

  const request = new NextRequest(finalUrl, {
    headers,
    // method: 'GET', // Middleware typically processes GET requests, but can be other methods
  });

  // If nextUrl.clone() is used by the middleware, NextRequest handles it.
  // If specific searchParams are needed, they can be added to the URL string.
  // e.g., `http://localhost:3000${pathname}?param=value`
  return request;
};


describe('Middleware', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockMiddlewareCookieStore.clear();
    jest.clearAllMocks();
    
    // Default mock for Supabase client and getSession
    mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }), // Default to no session
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  const protectedRoutes = [
    '/dashboard',
    '/chat',
    '/api/user/profile',
    '/me',
    '/settings',
    '/feedback'
  ];
  const publicRoutes = ['/', '/about', '/auth/login', '/auth/signup']; // '/auth/register' is covered by '/auth/signup'

  protectedRoutes.forEach(route => {
    it(`should redirect unauthenticated user from protected route ${route} to /auth/login`, async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
      const request = mockNextRequest(route); // No cookies for unauthenticated
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Or 302, depending on NextResponse.redirect default
      
      const locationHeader = response.headers.get('location');
      expect(locationHeader).toBeTruthy();
      const redirectUrl = new URL(locationHeader!);
      expect(redirectUrl.pathname).toBe('/auth/login');
      expect(redirectUrl.origin).toBe(request.nextUrl.origin); // Also check origin if needed
    });

    it(`should allow authenticated user to access protected route ${route}`, async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null });
      // Simulate an authenticated user by setting a cookie that Supabase might look for
      // This is a placeholder; the actual cookie name/value depends on Supabase client behavior
      const request = mockNextRequest(route, 'sb-access-token=fake-token');
      const response = await middleware(request);
      
      // Expecting NextResponse.next()
      expect(response.status).toBe(200); // Default status for NextResponse.next()
      // Check that it's not a redirect
      expect(response.headers.get('location')).toBeNull();
    });
  });

  publicRoutes.forEach(route => {
    it(`should allow unauthenticated user to access public route ${route}`, async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
      const request = mockNextRequest(route); // No cookies for unauthenticated
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });

    it(`should allow authenticated user to access public route ${route}`, async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null });
      const request = mockNextRequest(route, 'sb-access-token=fake-token'); // Authenticated
      const response = await middleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  // The test for /api/user/profile is now part of the protectedRoutes loop.
  // The matcher config in middleware.ts is: '/((?!_next/static|_next/image|favicon.ico|auth/.*).*)'
  // This means /api/* routes (unless explicitly excluded like /api/auth/* if that were a pattern) ARE processed by the middleware.
  // The publicRoutes array already covers /auth/login and /auth/signup, which are correctly excluded by the matcher.
});