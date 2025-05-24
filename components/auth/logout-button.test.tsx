// components/auth/logout-button.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogoutButton from './logout-button';
import { createClient } from '@/lib/supabaseClients'; // Actual import

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    // Add other router methods if your component uses them
  }),
}));

// Mock Supabase client
jest.mock('@/lib/supabaseClients', () => ({
  createClient: jest.fn(),
}));

const mockSupabaseClient = createClient as jest.Mock;

// Mock window.alert
global.alert = jest.fn();

describe('LogoutButton', () => {
  let mockSignOut: jest.Mock;

  beforeEach(() => {
    mockSignOut = jest.fn();
    mockSupabaseClient.mockReturnValue({
      auth: {
        signOut: mockSignOut,
      },
    });
    // Reset mocks before each test
    mockSignOut.mockReset();
    mockPush.mockClear();
    (global.alert as jest.Mock).mockClear();
  });

  it('renders the logout button', () => {
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls supabase.auth.signOut and redirects on successful logout', async () => {
    mockSignOut.mockResolvedValueOnce({ error: null }); // Mock successful logout

    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
    expect(global.alert).not.toHaveBeenCalled();
  });

  it('displays an alert if logout fails', async () => {
    const errorMessage = 'Logout failed due to network error';
    mockSignOut.mockResolvedValueOnce({ error: { message: errorMessage } }); // Mock failed logout

    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(`Logout failed: ${errorMessage}`);
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});