/**
 * @jest-environment node
 */
import OpenAI from 'openai';
// Assuming the client instance is exported, or a function that returns it.
// Modify the import based on actual export from openaiClient.ts
// import { getOpenAIClient } from './openaiClient'; // Removed top-level import

jest.mock('openai', () => {
  // Mock the OpenAI class constructor and any methods used during initialization
  const mockCompletionsCreate = jest.fn();
  return jest.fn().mockImplementation(() => ({
    completions: {
      create: mockCompletionsCreate,
    },
    // Add other OpenAI client features if they are used e.g. chat, embeddings
    chat: {
        completions: {
            create: jest.fn()
        }
    }
  }));
});

describe('OpenAI Client Initialization (lib/openaiClient.ts)', () => {
  const originalEnv = { ...process.env };
  let openaiClientModule: typeof import('./openaiClient');

  beforeEach(() => {
    process.env = { ...originalEnv }; // Restore env first
    jest.resetModules(); // THEN reset modules

    // Set necessary env var for these tests BEFORE any require of openaiClient
    process.env.OPENAI_API_KEY = 'test-openai-key';

    // Call the test-only reset function.
    // Import it once to call the reset.
    // Note: This require might trigger the console.log in openaiClient.ts
    const tempOpenAIClientModule = require('./openaiClient');
    if (tempOpenAIClientModule.__TEST_ONLY_resetOpenAIClientInstance) {
      tempOpenAIClientModule.__TEST_ONLY_resetOpenAIClientInstance();
    }
    
    // Re-require module under test to get the (hopefully) truly fresh instance
    openaiClientModule = require('./openaiClient');

    // Clear the mock constructor itself (OpenAI imported from 'openai')
    (OpenAI as unknown as jest.Mock).mockClear();
    
    // If your top-level mock (lines 9-23) creates a shared instance whose methods are jest.fn(),
    // you might need to clear those too if they accumulate calls across tests.
    // e.g., if mockOpenAIInstance.chat.completions.create is a jest.fn defined outside this scope.
    // However, since OpenAI constructor itself is a jest.fn(), clearing it should suffice if
    // a new mock instance is returned each time the constructor is called.
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw an error if OPENAI_API_KEY is missing', () => {
    delete process.env.OPENAI_API_KEY;
    // Expect getOpenAIClient to throw or the OpenAI constructor (if called directly) to throw
    // This depends on the implementation within openaiClient.ts
    try {
        openaiClientModule.getOpenAIClient(); // or simply: require('./openaiClient'); if it initializes on import
        // If it doesn't throw, explicitly fail
        throw new Error('Client initialized without API key, which should not happen.');
    } catch (error: any) {
        expect(error.message).toMatch(/OPENAI_API_KEY is not set/i);
    }
  });

  it('should initialize OpenAI client without errors if OPENAI_API_KEY is present', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    
    let client;
    expect(() => {
      client = openaiClientModule.getOpenAIClient();
    }).not.toThrow();
    
    expect(client).toBeDefined();
    // Check if OpenAI constructor was called
    expect(OpenAI).toHaveBeenCalledTimes(1);
    expect(OpenAI).toHaveBeenCalledWith({ apiKey: 'test-openai-key' });
  });

  it('should return the same client instance on subsequent calls', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key-singleton';
    const client1 = openaiClientModule.getOpenAIClient();
    expect(OpenAI).toHaveBeenCalledTimes(1); // Called once for the first initialization

    const client2 = openaiClientModule.getOpenAIClient();
    expect(client1).toBe(client2);
    expect(OpenAI).toHaveBeenCalledTimes(1); // Still only called once
  });
});