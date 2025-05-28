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

// Mock Supabase client - No longer needed for direct calls from this component
// jest.mock('@/lib/supabaseClients', () => ({
//   createClient: jest.fn(),
// }));

// const mockSupabaseClient = createClient as jest.Mock;

// Mock global fetch
global.fetch = jest.fn();

describe('SignUpPage', () => {
  // let mockSignUp: jest.Mock; // No longer directly mocking supabase.auth.signUp here
  let mockFetch: jest.Mock;

  beforeEach(() => {
    // mockSignUp = jest.fn(); // No longer needed
    // mockSupabaseClient.mockReturnValue({ // No longer needed
    //   auth: {
    //     signUp: mockSignUp,
    //   },
    // });
    mockFetch = global.fetch as jest.Mock;
    mockFetch.mockReset();
  });

  it('renders the sign up form', () => {
    render(<SignUpPage />);
    expect(screen.getByRole('heading', { name: /join ai girlfriend/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument(); // More specific
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument(); // More specific
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('allows typing in email and password fields', () => {
    render(<SignUpPage />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement; // More specific
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement; // More specific

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  it('calls /api/auth/register on form submission and displays success message', async () => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValueOnce({ message: 'Sign up successful! Please check your email to confirm your account.' }),
    } as unknown as Response);
 
    render(<SignUpPage />);
    const testName = 'Test User';
 
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: testName } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testEmail } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: testPassword } }); // More specific
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: testPassword } }); // Added confirm
    fireEvent.submit(screen.getByTestId('signup-form'));
 
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
      });
    });
 
    await waitFor(() => {
      expect(screen.getByText('Sign up successful! Please check your email to confirm your account.')).toBeInTheDocument();
    });
  });

  it('displays an error message if /api/auth/register call fails (e.g. user already exists)', async () => {
    const testEmail = 'existing@example.com';
    const testPassword = 'password123';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      json: jest.fn().mockResolvedValueOnce({ error: 'User already exists' }),
    } as unknown as Response);

    render(<SignUpPage />);
    const testName = 'Existing User';

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: testName } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testEmail } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: testPassword } }); // More specific
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: testPassword } }); // Added confirm
    fireEvent.submit(screen.getByTestId('signup-form'));
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('displays an error message if /api/auth/register call fails with details', async () => {
    const testEmail = 'detailedfail@example.com';
    const testPassword = 'password123';
    const errorDetails = { field: 'email', issue: 'Invalid format' };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: jest.fn().mockResolvedValueOnce({ error: 'Validation failed', details: errorDetails }),
    } as unknown as Response);

    render(<SignUpPage />);
    const testName = 'Detailed Fail User';
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: testName } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testEmail } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: testPassword } }); // More specific
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: testPassword } }); // Added confirm
    fireEvent.submit(screen.getByTestId('signup-form'));

    await waitFor(() => {
      // We also need to assert mockFetch was called here
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
      });
      // The component formats this error message differently
      expect(screen.getByText(`Registration failed: ${errorDetails.field} ${errorDetails.issue}`)).toBeInTheDocument();
    });
  });


  it('displays an error message if /api/auth/register call throws a network error', async () => {
    const testEmail = 'network@example.com';
    const testPassword = 'password123';
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<SignUpPage />);
    const testName = 'Network Error User';
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: testName } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testEmail } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: testPassword } }); // More specific
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: testPassword } }); // Added confirm
    fireEvent.submit(screen.getByTestId('signup-form'));
    
    await waitFor(() => {
      // We also need to assert mockFetch was called here
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
      });
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });
  });
});