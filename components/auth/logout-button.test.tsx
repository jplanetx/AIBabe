import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClients';
import LogoutButton from './logout-button'; // Assuming the component will be in the same directory

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock supabase client
jest.mock('@/lib/supabaseClients', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}));

// Mock ShadCN UI Button (or any UI library button used)
jest.mock('@/components/ui/button', () => ({
  __esModule: true,
  Button: ({ onClick, children }: { onClick: React.MouseEventHandler<HTMLButtonElement>; children: React.ReactNode }) => (
    <button onClick={onClick} data-testid="logout-button-mock">{children}</button>
  ),
}));


describe('LogoutButton', () => {
  let mockRouterPush: jest.Mock;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockRestore();
  });

  it('renders the logout button', () => {
    render(<LogoutButton />);
    expect(screen.getByTestId('logout-button-mock')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls supabase.auth.signOut() and redirects on successful logout', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('logs an error and does not redirect if signOut fails', async () => {
    const errorMessage = 'Sign out failed';
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: { message: errorMessage, name: 'AuthError', status: 500 } });

    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Error signing out:', { message: errorMessage, name: 'AuthError', status: 500 });
    });
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('handles unexpected error structure from signOut', async () => {
    const unexpectedError = new Error('Unexpected error');
    (supabase.auth.signOut as jest.Mock).mockRejectedValueOnce(unexpectedError);

    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Error signing out:', unexpectedError);
    });
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});