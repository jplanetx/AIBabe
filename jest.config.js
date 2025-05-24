module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  transform: {
    // Use babel-jest with next/babel preset for all js, jsx, ts, tsx files
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleNameMapper: {
    // Handle path aliases
    '^@/(.*)$': '<rootDir>/$1',
  },
  // moduleFileExtensions is usually not needed when using babel-jest with next/babel
  // as babel-jest handles file discovery based on the transform pattern.
  // If issues arise, it can be added back:
  // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
