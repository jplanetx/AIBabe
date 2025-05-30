module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/jest.setup.js'],
  transform: {
    // Use babel-jest with next/babel preset for all js, jsx, ts, tsx files
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleNameMapper: {
    // Handle path aliases
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Use different test environments for different file patterns
  projects: [
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['@testing-library/jest-dom'],
      testMatch: [
        '<rootDir>/app/**/*.test.{js,jsx,ts,tsx}', // Will still match app/api initially
        '<rootDir>/components/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/lib/**/*.test.{js,jsx,ts,tsx}',
        // Removed negation: '!<rootDir>/app/api/**/*.test.{js,jsx,ts,tsx}',
      ],
      testPathIgnorePatterns: [ // Added to explicitly ignore app/api paths for jsdom
        '/node_modules/',
        '<rootDir>/app/api/'
      ],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/app/api/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/middleware.test.{js,jsx,ts,tsx}',
      ],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
  ],
  // moduleFileExtensions is usually not needed when using babel-jest with next/babel
  // as babel-jest handles file discovery based on the transform pattern.
  // If issues arise, it can be added back:
  // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
