// app/auth/login/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page';
// import { createClient } from '@/lib/supabaseClients'; // No longer directly used
import { useRouter } from 'next/navigation'; // Already mocked

// Mock global fetch
global.fetch = jest.fn();

// Mock Next.js router
const mockPush = jest.fn();
const mockRefresh = jest.fn(); // Added for router.refresh()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: mockRefresh, // Added mock for refresh
  }),
}));

// Remove Supabase client direct mock as component uses fetch
// jest.mock('@/lib/supabaseClients', () => ({
//   createClient: jest.fn(),
// }));
// const mockSupabaseClient = createClient as jest.Mock;

describe('LoginPage', () => {
  // let mockSignInWithPassword: jest.Mock; // No longer used
  let mockFetch: jest.Mock;

  beforeEach(() => {
    // mockSignInWithPassword = jest.fn(); // No longer used
    // mockSupabaseClient.mockReturnValue({ // No longer used
    //   auth: {
    //     signInWithPassword: mockSignInWithPassword,
    //   },
    // });
    
    mockFetch = global.fetch as jest.Mock;
    mockFetch.mockReset();
    mockPush.mockClear();
    mockRefresh.mockClear(); // Clear refresh mock
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows typing in email and password fields', () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls /api/auth/login on form submission, displays success, and redirects', async () => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ message: 'Login successful!', user: { id: 'user-123', email: testEmail } }),
    } as unknown as Response);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testEmail } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: testPassword } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Login successful!')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding'); // Changed from /dashboard
    });
  });

  it('displays an error message if /api/auth/login call fails', async () => {
    const testEmail = 'wrong@example.com';
    const testPassword = 'wrongpassword';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
      json: jest.fn().mockResolvedValueOnce({ error: 'Invalid login credentials' }),
    } as unknown as Response);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testEmail } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: testPassword } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Login failed: Invalid login credentials')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays an error message if /api/auth/login call fails with details', async () => {
    const testEmail = 'detailedfail@example.com';
    const testPassword = 'password123';
    const errorDetails = { code: 'AUTH_001', reason: 'Account locked' };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Forbidden',
      json: jest.fn().mockResolvedValueOnce({ error: 'Access denied', details: errorDetails }),
    } as unknown as Response);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testEmail } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: testPassword } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(`Login failed: ${JSON.stringify(errorDetails)}`)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays a generic error message on network or unexpected error during login', async () => {
    const testEmail = 'network@example.com';
    const testPassword = 'password123';
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testEmail } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: testPassword } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Login failed due to a network or unexpected error. Please try again.')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});