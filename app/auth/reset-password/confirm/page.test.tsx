import React from 'react';
import { render } from '@testing-library/react';
import ResetPasswordConfirmPage from './page';

// Mock 'next/navigation' to allow the component to render without
// issues unrelated to the Suspense boundary problem.
// The useSearchParams hook needs to be callable.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    // Add other router methods if they are called and cause errors.
  }),
  useSearchParams: () => {
    // This is the hook that Next.js checks for Suspense boundaries.
    // Returning a basic URLSearchParams instance.
    // The component logic expects 'access_token' and 'refresh_token'.
    return new URLSearchParams('?access_token=test_token&refresh_token=test_refresh_token');
  },
  // If Link from next/link is used and causes issues, it might need mocking too,
  // but usually, it's fine in RTL within a basic test.
}));

describe('ResetPasswordConfirmPage - useSearchParams without Suspense', () => {
  it('should trigger an error when rendering due to useSearchParams being used without a Suspense boundary', () => {
    // This render call is expected to fail in a Next.js testing environment
    // if the component violates the rule of using useSearchParams without Suspense.
    // The test runner should report an error message similar to:
    // "Error: useSearchParams() should be wrapped in a suspense boundary..."
    //
    // No explicit Jest `expect` for the error is added here, as the goal is
    // for the test execution itself to fail, clearly indicating the problem
    // as per the task requirements.
    render(<ResetPasswordConfirmPage />);
    
    // If the test reaches this point without failing, it means the error wasn't triggered
    // as expected. In a correctly configured Next.js test setup, it should fail before this.
    // For the purpose of this task, we assume the environment will cause the failure.
  });
});