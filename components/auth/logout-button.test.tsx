// This mock MUST be at the top, before any imports.
// The mockSignOut function is defined *inside* the factory.
jest.mock('@/lib/supabaseClients', () => {
  const mockSignOutInstance = jest.fn();
  return {
    __esModule: true,
    supabase: {
      auth: {
        signOut: mockSignOutInstance,
      },
    },
    createClient: jest.fn(() => ({
      auth: {
        signOut: mockSignOutInstance,
      },
    })),
  };
});

// components/auth/logout-button.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogoutButton from './logout-button';
// Import the mocked supabase client to access the mock function for tests
import { supabase } from '@/lib/supabaseClients';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock window.alert
global.alert = jest.fn();

describe('LogoutButton', () => {
  // Get a reference to the mock function from the mocked module
  const mockSignOut = supabase.auth.signOut as jest.Mock;

  beforeEach(() => {
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