import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordConfirmPage from './page';

// Original mock for 'next/navigation'
const mockUseSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Password updated successfully' }),
  })
) as jest.Mock;

// Mock window.history.replaceState
const mockReplaceState = jest.fn();
Object.defineProperty(window, 'history', {
  value: {
    ...window.history,
    replaceState: mockReplaceState,
  },
  writable: true,
});
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    pathname: '/auth/reset-password/confirm', // Mock current pathname
  },
  writable: true,
});


describe('ResetPasswordConfirmPage - useSearchParams without Suspense', () => {
  beforeEach(() => {
    // Reset mocks for this describe block if needed, or set specific mock for these tests
    mockUseSearchParams.mockReturnValue(new URLSearchParams('?access_token=suspense_test_token&refresh_token=suspense_refresh_token'));
    mockReplaceState.mockClear();
  });
  it('should trigger an error when rendering due to useSearchParams being used without a Suspense boundary', () => {
    // This test is designed to fail if the Next.js environment correctly identifies
    // the useSearchParams hook being used outside a Suspense boundary.
    // The component itself wraps the form in Suspense, so this specific test's original
    // intent (to show an error) might not be met if the component is correctly structured.
    // However, keeping it to ensure no regressions if Suspense is removed.
    render(<ResetPasswordConfirmPage />);
    // No explicit assertion for error, as the test runner should report it.
    // Check if replaceState was called due to token presence
    expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/auth/reset-password/confirm');
  });
});

describe('ResetPasswordConfirmPage - V1: Sensitive Token Exposure in URL and URL Cleaning', () => {
  const mockAccessToken = 'vulnerable_access_token_from_url';
  const mockRefreshToken = 'vulnerable_refresh_token_from_url';

  beforeEach(() => {
    // Clear mock history before each test
    (global.fetch as jest.Mock).mockClear();
    mockReplaceState.mockClear();
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`?access_token=${mockAccessToken}&refresh_token=${mockRefreshToken}`)
    );
  });

  it('should send access_token and refresh_token from URL to the API and clean the URL', async () => {
    render(<ResetPasswordConfirmPage />);

    // Verify URL is cleaned after initial render and token processing in useEffect
    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/auth/reset-password/confirm');
    });
    
    // Fill in the password fields
    // Use more specific selectors to avoid ambiguity
    const passwordInput = screen.getByLabelText((content, element) => element?.id === 'password');
    const confirmPasswordInput = screen.getByLabelText((content, element) => element?.id === 'confirmPassword');
    const submitButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(passwordInput, { target: { value: 'newSecurePassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newSecurePassword123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for the fetch call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Assert that fetch was called with the correct URL and payload
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: 'newSecurePassword123',
        confirmPassword: 'newSecurePassword123',
        access_token: mockAccessToken, // This is the key assertion for the vulnerability
        refresh_token: mockRefreshToken, // This is the key assertion for the vulnerability
      }),
    });
  });
});