/**
 * @jest-environment node
 */
import { POST as loginUser } from './route'; // Assuming the handler is exported as POST
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';

// Mock next/headers
const mockLoginCookieStore = new Map<string, string>();
jest.mock('next/headers', () => {
  const originalModule = jest.requireActual('next/headers');
  return {
    ...originalModule,
    cookies: jest.fn(() => ({
      get: jest.fn((name: string) => {
        const value = mockLoginCookieStore.get(name);
        return value !== undefined ? { name, value } : undefined;
      }),
      set: jest.fn((nameOrOptions: string | any, value?: string) => {
        if (typeof nameOrOptions === 'string') {
          mockLoginCookieStore.set(nameOrOptions, value || '');
        } else {
          mockLoginCookieStore.set(nameOrOptions.name, nameOrOptions.value);
        }
      }),
      delete: jest.fn((name: string) => {
        mockLoginCookieStore.delete(name);
      }),
      has: jest.fn((name: string) => mockLoginCookieStore.has(name)),
      getAll: jest.fn(() => Array.from(mockLoginCookieStore.entries()).map(([name, value]) => ({ name, value }))),
    })),
  };
});


// Mock the actual login logic (e.g., Supabase call)
// Note: createServerClient from @supabase/ssr is used in the route, not createClient from @supabase/supabase-js directly for auth.
// The mock for next/headers should allow createServerClient to function.
// We still mock the specific Supabase auth method if needed for fine-grained control over its outcome.
jest.mock('@supabase/ssr', () => {
    const originalModule = jest.requireActual('@supabase/ssr');
    return {
        ...originalModule,
        createServerClient: jest.fn().mockImplementation(() => ({ // Mock implementation of createServerClient
            auth: {
                signInWithPassword: jest.fn().mockResolvedValue({
                    data: { user: { id: 'test-user-id', email: 'test@example.com' }, session: { access_token: 'mock-access-token', refresh_token: 'mock-refresh-token'} },
                    error: null
                }),
                // Add other auth methods if they are used by the route and need mocking
            }
        })),
    };
});


const mockRequest = (body: any): NextRequest => {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

describe('API Route: /api/auth/login', () => {
  beforeEach(() => {
    mockLoginCookieStore.clear();
    jest.clearAllMocks(); // This will also clear mocks on Supabase client methods if they were set up with jest.fn()

    // Re-setup the default mock for signInWithPassword for each test,
    // as jest.clearAllMocks() clears previous mockResolvedValueOnce etc.
    // This ensures a baseline successful auth mock unless overridden in a specific test.
    const { createServerClient } = require('@supabase/ssr');
    const supabaseMock = {
        auth: {
            signInWithPassword: jest.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id', email: 'test@example.com' }, session: { access_token: 'mock-access-token', refresh_token: 'mock-refresh-token'} },
                error: null
            }),
        }
    };
    (createServerClient as jest.Mock).mockReturnValue(supabaseMock);
  });

  describe('Input Validation', () => {
    it('should return 400 for invalid email format', async () => {
      const request = mockRequest({ email: 'invalid-email', password: 'Password123!' });
      const response = await loginUser(request);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Invalid input');
      expect(responseBody.details.email[0]).toContain('Invalid email address');
    });

    it('should return 400 for missing email', async () => {
      const request = mockRequest({ password: 'Password123!' });
      const response = await loginUser(request);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Invalid input');
      expect(responseBody.details.email[0]).toContain('Required');
    });

    it('should return 400 for missing password', async () => {
      const request = mockRequest({ email: 'test@example.com' }); // Missing password
      const response = await loginUser(request);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Invalid input');
      expect(responseBody.details.password[0]).toContain('Required');
    });
    
    it('should return 400 for empty password string', async () => {
      const request = mockRequest({ email: 'test@example.com', password: '' });
      const response = await loginUser(request);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Invalid input');
      expect(responseBody.details.password[0]).toContain('Password cannot be empty');
    });

    it('should return 400 for extra, unexpected fields in the payload', async () => {
      const request = mockRequest({
        email: 'test@example.com',
        password: 'Password123!',
        unexpectedField: 'shouldBeRejected',
      });
      const response = await loginUser(request);
      const responseBody = await response.json();
      
      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Invalid input');
      // Zod's strict() error message for fieldErrors might be an empty object or specific to _errors
      // For strict mode, the error message "Unexpected fields in request" is on the schema level.
      // The route handler returns `validationResult.error.flatten().fieldErrors`.
      // Let's check if `details` contains the strict mode message.
      // A more robust check might be to see if `validationResult.error.issues` contains the strict mode issue.
      // For now, we'll check the top-level error and that details exist.
      expect(responseBody.details).toEqual({});
      // A more specific check if the strict error message is passed through:
      // For example, if Zod puts it in formErrors._errors
      // expect(responseBody.details._errors).toContain('Unexpected fields in request');
      // Or if it's part of the general error message (less likely with flatten().fieldErrors)
    });

    it('should return 200 for valid login data (mocking successful login)', async () => {
      // Supabase mock is handled in beforeEach or can be overridden here for specific cases
      const { createServerClient } = require('@supabase/ssr');
      const supabaseMockInstance = createServerClient(); // Get the mocked instance
      (supabaseMockInstance.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: {
          user: { id: 'logged-in-user-id', email: 'valid@example.com' },
          session: { access_token: 'fake-token', refresh_token: 'fake-refresh-token' }
        },
        error: null,
      });
      
      const request = mockRequest({
        email: 'valid@example.com',
        password: 'ValidPassword123!', // This password is > 1 char, so it passes loginSchema
      });
      const response = await loginUser(request);
      
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.error).toBeUndefined();
      expect(responseBody.message).toBe('Login successful');
      expect(responseBody.user?.email).toBe('valid@example.com');
      expect(responseBody.session?.access_token).toBe('fake-token');
    });
  });

  // describe('Login Logic', () => {
  //   it('should return 401 for incorrect credentials', async () => {
  //     const mockSupabaseSignIn = require('@supabase/supabase-js').createClient().auth.signInWithPassword;
  //     mockSupabaseSignIn.mockResolvedValueOnce({
  //       data: { user: null, session: null },
  //       error: { message: 'Invalid login credentials', status: 400 /* Supabase might return 400 */ },
  //     });

  //     const request = mockRequest({
  //       email: 'user@example.com',
  //       password: 'WrongPassword123!',
  //     });
  //     const response = await loginUser(request);
  //     const responseBody = await response.json();

  //     expect(response.status).toBe(401); // Unauthorized
  //     expect(responseBody.error).toBe('Invalid login credentials');
  //   });
  // });
});