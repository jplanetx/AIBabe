/**
 * @jest-environment node
 */
import { POST as loginUser } from './route';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Mock next/headers
const mockSetCookie = jest.fn();
const mockGetCookie = jest.fn();
const mockDeleteCookie = jest.fn();
const mockHasCookie = jest.fn();
const mockGetAllCookies = jest.fn(() => []);

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockImplementation(() => {
    return {
      get: mockGetCookie,
      set: mockSetCookie,
      delete: mockDeleteCookie,
      has: mockHasCookie,
      getAll: mockGetAllCookies,
    };
  }),
}));

// Mock @supabase/ssr
const mockSignInWithPasswordInternal = jest.fn(); // This will be controlled by individual tests

jest.mock('@supabase/ssr', () => {
  return {
    createServerClient: jest.fn().mockImplementation((_supabaseUrl, _supabaseKey, options) => {
      // The 'set' function from the route's cookie options (which will be our mockSetCookie)
      const routeCookieSetFunction = options?.cookies?.set;

      return {
        auth: {
          signInWithPassword: async (credentials: any) => {
            const result = await mockSignInWithPasswordInternal(credentials);
            // If signIn is successful and the route provided a 'set' function
            if (result?.data?.session && !result.error && typeof routeCookieSetFunction === 'function') {
              // Simulate Supabase client calling the route-provided 'set' function
              await routeCookieSetFunction(
                'sb-mock-access-token', // Mocked cookie name for test predictability
                result.data.session.access_token,
                { path: '/', httpOnly: true, sameSite: 'lax', maxAge: result.data.session.expires_in } as CookieOptions
              );
              await routeCookieSetFunction(
                'sb-mock-refresh-token', // Mocked cookie name
                result.data.session.refresh_token,
                { path: '/', httpOnly: true, sameSite: 'lax' } as CookieOptions
              );
            }
            return result;
          },
        },
      };
    }),
  };
});

const mockRequest = (body: any, contentType: string = 'application/json'): NextRequest => {
  const headers = new Headers();
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers,
    body: contentType === 'application/json' ? JSON.stringify(body) : body,
  });
};

describe('API Route: /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful login for mockSignInWithPasswordInternal
    mockSignInWithPasswordInternal.mockResolvedValue({
      data: { 
        user: { id: 'test-user-id', email: 'test@example.com' }, 
        session: { access_token: 'mock-access-token-value', refresh_token: 'mock-refresh-token-value', expires_in: 3600 } 
      },
      error: null,
    });
    mockGetCookie.mockImplementation((name: string) => undefined);
    mockSetCookie.mockClear();
  });

  describe('Successful Login', () => {
    it('should return 200 and user data on successful login', async () => {
      const request = mockRequest({ email: 'test@example.com', password: 'password123' });
      const response = await loginUser(request);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody.message).toBe('Login successful');
      expect(responseBody.user).toEqual({ id: 'test-user-id', email: 'test@example.com' });
    });

    it('should set Supabase auth cookies on successful login', async () => {
      const request = mockRequest({ email: 'test@example.com', password: 'password123' });
      await loginUser(request);
      
      expect(mockSetCookie).toHaveBeenCalledTimes(2); 

      const accessTokenCall = mockSetCookie.mock.calls.find(call => call[0].includes('access-token'));
      expect(accessTokenCall).toBeDefined();
      expect(accessTokenCall?.[0]).toBe('sb-mock-access-token'); 
      expect(accessTokenCall?.[1]).toBe('mock-access-token-value');
      expect(accessTokenCall?.[2]).toMatchObject({
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 3600,
      });

      const refreshTokenCall = mockSetCookie.mock.calls.find(call => call[0].includes('refresh-token'));
      expect(refreshTokenCall).toBeDefined();
      expect(refreshTokenCall?.[0]).toBe('sb-mock-refresh-token');
      expect(refreshTokenCall?.[1]).toBe('mock-refresh-token-value');
      expect(refreshTokenCall?.[2]).toMatchObject({
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });
    });
  });

  describe('Input Validation and Error Handling', () => {
    it('should return 400 for invalid email format', async () => {
      const request = mockRequest({ email: 'invalid-email', password: 'Password123!' });
      const response = await loginUser(request);
      const responseBody = await response.json();
      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Invalid input');
      expect(responseBody.details.email).toContain('Invalid email address');
    });

    it('should return 400 for missing email', async () => {
        const request = mockRequest({ password: 'Password123!' });
        const response = await loginUser(request);
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody.error).toBe('Invalid input');
        expect(responseBody.details.email).toContain('Required');
      });
  
      it('should return 400 for missing password', async () => {
        const request = mockRequest({ email: 'test@example.com' });
        const response = await loginUser(request);
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody.error).toBe('Invalid input');
        expect(responseBody.details.password).toContain('Required');
      });

    it('should return 400 for empty password string', async () => {
      const request = mockRequest({ email: 'test@example.com', password: '' });
      const response = await loginUser(request);
      const responseBody = await response.json();
      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Invalid input');
      expect(responseBody.details.password).toContain('Password cannot be empty');
    });
    
    it('should return 400 if request body is not JSON', async () => {
        const request = mockRequest('this is not json', 'text/plain');
        const response = await loginUser(request);
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody.error).toBe('Invalid request body: Not JSON');
    });

    it('should return 400 for invalid credentials (Supabase returns 400)', async () => {
      mockSignInWithPasswordInternal.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials.', status: 400 }, 
      });
      const request = mockRequest({ email: 'test@example.com', password: 'wrongpassword' });
      const response = await loginUser(request);
      const responseBody = await response.json();
      expect(response.status).toBe(400); 
      expect(responseBody.error).toBe('Invalid login credentials.');
    });

    it('should return 401 for invalid credentials (Supabase returns 401)', async () => {
        mockSignInWithPasswordInternal.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials.', status: 401 }, 
        });
        const request = mockRequest({ email: 'test@example.com', password: 'wrongpassword' });
        const response = await loginUser(request);
        const responseBody = await response.json();
        expect(response.status).toBe(401); 
        expect(responseBody.error).toBe('Invalid login credentials.');
      });
    
    it('should return 429 for rate limiting', async () => {
        mockSignInWithPasswordInternal.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Too many requests.', status: 429 },
        });
        const request = mockRequest({ email: 'test@example.com', password: 'password123' });
        const response = await loginUser(request);
        const responseBody = await response.json();
        expect(response.status).toBe(429);
        expect(responseBody.error).toBe('Too many login attempts. Please try again later.');
      });

    it('should return 500 if Supabase client throws an unexpected error (e.g. network issue)', async () => {
      mockSignInWithPasswordInternal.mockRejectedValue(new Error('Supabase network error'));
      const request = mockRequest({ email: 'test@example.com', password: 'password123' });
      const response = await loginUser(request);
      const responseBody = await response.json();
      expect(response.status).toBe(500);
      expect(responseBody.error).toBe('An unexpected server error occurred.');
    });
    
    it('should return 500 if Supabase auth returns a 5xx error', async () => {
        mockSignInWithPasswordInternal.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Supabase server unavailable', status: 503 },
        });
        const request = mockRequest({ email: 'test@example.com', password: 'password123' });
        const response = await loginUser(request);
        const responseBody = await response.json();
        expect(response.status).toBe(500);
        expect(responseBody.error).toBe('Login failed due to an external service error. Please try again later.');
      });

    it('should return 500 if signInWithPassword returns no user and no error (unexpected state)', async () => {
        mockSignInWithPasswordInternal.mockResolvedValue({ data: { user: null, session: null }, error: null });
        const request = mockRequest({ email: 'test@example.com', password: 'password123' });
        const response = await loginUser(request);
        const responseBody = await response.json();
        expect(response.status).toBe(500);
        expect(responseBody.error).toBe('Login failed due to an unexpected issue. Please try again.');
    });
  });
});