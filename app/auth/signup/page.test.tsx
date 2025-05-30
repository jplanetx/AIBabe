import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupPage from './page'; // Assuming the component is default exported from page.tsx
import { supabase } from '@/lib/supabaseClients'; // Ensure this path is correct

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock Supabase client
jest.mock('@/lib/supabaseClients', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

describe('SignupPage', () => {
  const mockRouterPush = jest.fn();
  beforeEach(() => {
    jest.useFakeTimers(); // Use fake timers
    jest.clearAllMocks();
    (require('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers
  });

  it('renders email, password, and confirm password fields, and a submit button', () => {
    render(<SignupPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows an error if passwords do not match', async () => {
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('calls supabase.auth.signUp on successful submission and redirects', async () => {
    const mockSignUp = supabase.auth.signUp as jest.Mock;
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: '123', email: 'test@example.com' }, session: {} },
      error: null,
    });

    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    // As per HLT 1.1, success message can be "Registration successful. Please check your email to verify." or "Welcome!"
    // Let's assume a generic success message for now, or a verification message.
    expect(await screen.findByText(/registration successful. please check your email to verify/i)).toBeInTheDocument();
    
    // As per HLT 1.1, redirection can be to login, email verification, or dashboard.
    // Let's assume redirection to /auth/login for this test.
    // Advance timers to trigger setTimeout
    jest.runAllTimers();
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('displays an error message if email already exists', async () => {
    const mockSignUp = supabase.auth.signUp as jest.Mock;
    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered', status: 400, name: 'AuthApiError' },
    });

    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'exists@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/user already registered/i)).toBeInTheDocument(); // Or a more user-friendly message like "User with this email already exists."
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('displays an error message for weak password', async () => {
    const mockSignUp = supabase.auth.signUp as jest.Mock;
    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Password should be stronger', status: 422, name: 'AuthApiError' }, // Example Supabase error for weak password
    });

    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'weak' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'weak' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/password should be stronger/i)).toBeInTheDocument(); // Or "Password is too weak."
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('displays a generic error message for other Supabase errors', async () => {
    const mockSignUp = supabase.auth.signUp as jest.Mock;
    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'An unexpected error occurred', status: 500, name: 'AuthApiError' },
    });

    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/an unexpected error occurred/i)).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});