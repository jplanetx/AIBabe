// components/layout/ClientLayout.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ClientLayout from './ClientLayout';
import { AppRouterContextProviderMock } from '@/lib/test-utils/AppRouterContextProviderMock'; // Adjust path as needed
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light', // Default theme for testing
    setTheme: jest.fn(),
  })),
}));


describe('ClientLayout', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(), // Added refresh
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    basePath: '',
    isReady: true,
    isPreview: false,
    isLocaleDomain: false,
    locale: 'en',
    locales: ['en'],
    defaultLocale: 'en',
    domainLocales: [],
    reload: jest.fn(),
    route: '/',
  };

  it('renders children without crashing', () => {
    render(
      <AppRouterContextProviderMock router={mockRouter}>
        <ClientLayout>
          <span>Test Child</span>
        </ClientLayout>
      </AppRouterContextProviderMock>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
});