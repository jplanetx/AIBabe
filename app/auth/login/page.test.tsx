// app/auth/login/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page';
import { createClient } from '@/lib/supabaseClients'; // Actual import

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
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

describe('LoginPage', () => {
  let mockSignInWithPassword: jest.Mock;

  beforeEach(() => {
    mockSignInWithPassword = jest.fn();
    mockSupabaseClient.mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    });
    // Reset mocks before each test
    mockSignInWithPassword.mockReset();
    mockPush.mockClear();
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
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

  it('calls supabase.auth.signInWithPassword on form submission, displays success, and redirects', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: '123', email: 'test@example.com' }, session: {} }, // Mock successful login
      error: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Login successful!')).toBeInTheDocument();
    });
    
    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/chat');
    });
  });

  it('displays an error message if login fails', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Login failed: Invalid login credentials')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays a generic error if login returns no user, no session and no error', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Login attempt finished. Status unclear. Please try again or contact support.')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});