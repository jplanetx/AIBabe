// app/auth/signup/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpPage from './page';
import { createClient } from '@/lib/supabaseClients'; // Actual import

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

// Mock Supabase client
jest.mock('@/lib/supabaseClients', () => ({
  createClient: jest.fn(),
}));

const mockSupabaseClient = createClient as jest.Mock;

// Mock global fetch
global.fetch = jest.fn();

describe('SignUpPage', () => {
 let mockSignUp: jest.Mock;
 let mockFetch: jest.Mock;

 beforeEach(() => {
   mockSignUp = jest.fn();
   mockSupabaseClient.mockReturnValue({
     auth: {
       signUp: mockSignUp,
     },
   });
   mockFetch = global.fetch as jest.Mock;
   // Reset mocks before each test
   mockSignUp.mockReset();
   mockFetch.mockReset();
 });

 it('renders the sign up form', () => {
    render(<SignUpPage />);
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('allows typing in email and password fields', () => {
    render(<SignUpPage />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls supabase.auth.signUp and profile API on form submission and displays success message', async () => {
    const testUser = { id: 'user-123', email: 'test@example.com', identities: [{ provider: 'email' }] };
    mockSignUp.mockResolvedValueOnce({
      data: { user: testUser },
      error: null,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: testUser.id, email: testUser.email }),
    } as Response);
 
    render(<SignUpPage />);
 
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testUser.email } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
 
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: testUser.email,
        password: 'password123',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    });
 
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: testUser.id, email: testUser.email }),
      });
    });
 
    await waitFor(() => {
      expect(screen.getByText('Sign up and profile creation successful! Please check your email to confirm your account.')).toBeInTheDocument();
    });
  });

  it('displays an error message if profile creation API call fails after successful Supabase signup', async () => {
    const testUser = { id: 'user-456', email: 'profilefail@example.com', identities: [{ provider: 'email' }] };
    mockSignUp.mockResolvedValueOnce({
      data: { user: testUser },
      error: null,
    });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Profile creation failed on server' }),
    } as Response);

    render(<SignUpPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testUser.email } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/profile', expect.anything());
    });

    await waitFor(() => {
      expect(screen.getByText('Sign up successful, but profile creation failed: Profile creation failed on server. Please check your email to confirm your account.')).toBeInTheDocument();
    });
  });

  it('displays an error message if profile creation API call throws a network error', async () => {
    const testUser = { id: 'user-789', email: 'networkerror@example.com', identities: [{ provider: 'email' }] };
    mockSignUp.mockResolvedValueOnce({
      data: { user: testUser },
      error: null,
    });
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<SignUpPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testUser.email } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/profile', expect.anything());
    });
    
    await waitFor(() => {
      expect(screen.getByText('Sign up successful, but profile creation failed. Please check your email to confirm your account.')).toBeInTheDocument();
    });
  });
 
  it('displays an error message if sign up fails (e.g. user already exists)', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: null }, // Or data: { user: { identities: [] } } if that's how Supabase indicates existing user
      error: { message: 'User already registered' },
    });

    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'existing@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Sign up failed: User already registered')).toBeInTheDocument();
    });
  });

  it('displays a specific error message if user object is returned but identities array is empty', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: '456', email: 'edgecase@example.com', identities: [] } }, // Empty identities array
      error: null,
    });
  
    render(<SignUpPage />);
  
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'edgecase@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
  
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'edgecase@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    });
  
    await waitFor(() => {
      expect(screen.getByText('Sign up failed: User might already exist or an issue occurred.')).toBeInTheDocument();
    });
  });

  it('displays a generic error if signup returns no user and no error', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Sign up attempt finished. Status unclear. Please try again or contact support.')).toBeInTheDocument();
    });
  });

});