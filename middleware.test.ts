/**
 * @jest-environment node
 */
import { middleware } from './middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

// Mock NextRequest and NextResponse
const mockNextRequest = (pathname: string, cookies: Record<string, string> = {}) => {
  const req = {
    nextUrl: {
      pathname,
      clone: jest.fn(), // We will mock this per test or in a beforeEach if needed
      origin: 'http://localhost:3000',
      searchParams: new URLSearchParams(), // Add searchParams to the base mock
      href: `http://localhost:3000${pathname}`, // Add href to the base mock
    },
    cookies: {
      get: jest.fn((name: string) => cookies[name] ? ({ name, value: cookies[name] }) : undefined),
      set: jest.fn(),
      remove: jest.fn(),
    },
    headers: new Headers(),
  } as unknown as NextRequest;
  // Default mock for clone, can be overridden in specific tests if needed
  (req.nextUrl.clone as jest.Mock).mockImplementation(() => new URL(req.nextUrl.href));
  return req;
};


describe('Middleware', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      auth: {
        getSession: jest.fn(),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  const protectedRoutes = ['/dashboard', '/chat'];
  const publicRoutes = ['/', '/about', '/auth/login', '/auth/signup'];

  protectedRoutes.forEach(route => {
    it(`should redirect unauthenticated user from protected route ${route} to /auth/login`, async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
      const request = mockNextRequest(route);
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
      const request = mockNextRequest(route);
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
      const request = mockNextRequest(route);
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });

    it(`should allow authenticated user to access public route ${route}`, async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null });
      const request = mockNextRequest(route);
      const response = await middleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });
  
  it('should handle API routes correctly (e.g. /api/user/profile) based on matcher config', async () => {
    // The matcher config in middleware.ts is: '/((?!_next/static|_next/image|favicon.ico|auth/.*).*)'
    // This means /api/user/profile IS processed by the middleware.
    
    // Test case: Unauthenticated access to /api/user/profile
    mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    const requestApiUnauth = mockNextRequest('/api/user/profile');
    const responseApiUnauth = await middleware(requestApiUnauth);
    expect(responseApiUnauth.status).toBe(307); // Redirect
    
    const locationHeaderApiUnauth = responseApiUnauth.headers.get('location');
    expect(locationHeaderApiUnauth).toBeTruthy();
    const redirectUrlApiUnauth = new URL(locationHeaderApiUnauth!);
    expect(redirectUrlApiUnauth.pathname).toBe('/auth/login');
    expect(redirectUrlApiUnauth.origin).toBe(requestApiUnauth.nextUrl.origin);


    // Test case: Authenticated access to /api/user/profile
    mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null });
    const requestApiAuth = mockNextRequest('/api/user/profile');
    const responseApiAuth = await middleware(requestApiAuth);
    expect(responseApiAuth.status).toBe(200);
    expect(responseApiAuth.headers.get('location')).toBeNull();
  });

});