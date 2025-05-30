import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page'; // The component to be tested
import { supabase } from '../../../lib/supabaseClients'; // Adjusted path

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
    back: mockBack,
    forward: mockForward,
    prefetch: mockPrefetch,
  }),
  redirect: (path: string) => mockPush(path), // Simplified mock for redirect
}));

// Mock Supabase client
jest.mock('../../../lib/supabaseClients', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (supabase.auth.signInWithPassword as jest.Mock).mockReset();
  });

  test('renders the login form correctly', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('handles successful login and redirects to /chat', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: '123' }, session: {} },
      error: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/chat');
    });

    // Check that no error message is displayed
    expect(screen.queryByText(/invalid login credentials/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('handles failed login and displays an error message', async () => {
    const errorMessage = 'Invalid login credentials.';
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: errorMessage, status: 400, name: 'AuthApiError' },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      // Or check for a generic role if you render error in a specific way
      // expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });

    // Ensure no redirection happened
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('displays error message from Supabase on failed login', async () => {
    const specificErrorMessage = 'User not found';
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: specificErrorMessage, status: 400, name: 'AuthApiError' },
    });
  
    render(<LoginPage />);
  
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'nonexistent@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'anypassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
    await waitFor(() => {
      expect(screen.getByText(specificErrorMessage)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  // Optional: Test for form submission with empty fields (if client-side validation is added)
  // For now, we assume Supabase handles this and returns an error, which should be covered by the failed login tests.
  // If specific client-side validation for empty fields is added, a new test case would be:
  /*
  test('displays error messages for empty fields if client-side validation is implemented', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Example: Assuming you show "Email is required" and "Password is required"
    // await waitFor(() => {
    //   expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    //   expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    // });
    // expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    // expect(mockPush).not.toHaveBeenCalled();
  });
  */
});