/**
 * @jest-environment node
 */
import OpenAI from 'openai'; // This will be the mocked OpenAI constructor
// Import the module to be tested using a dynamic import within tests after mocks are set up.

// Mock the 'openai' module to control the OpenAI class constructor
// This mock will replace the actual 'openai' module for this test file.
const mockOpenAIInstance = {
  // Mock any methods of an OpenAI instance that your client code might use
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'mocked completion' } }] }),
    },
  },
  embeddings: {
    create: jest.fn().mockResolvedValue({ data: [{ embedding: [0.1, 0.2] }] }),
  }
  // Add other necessary mocked methods of the OpenAI client instance here
};

// This is the mock for the OpenAI class constructor itself
const mockOpenAIConstructor = jest.fn(() => {
  console.log('MOCKED OpenAI constructor CALLED'); // Debug log
  return mockOpenAIInstance;
});

jest.mock('openai', () => ({
  __esModule: true, // This is important for ES modules
  default: mockOpenAIConstructor, // Mock the default export which is the OpenAI class
}));


describe('OpenAI Client Initialization (lib/openaiClient.ts)', () => {
  const originalEnv = { ...process.env };
  let openaiClientModule: typeof import('./openaiClient');

  beforeEach(() => {
    process.env = { ...originalEnv }; 
    jest.resetModules(); // Reset modules to ensure a fresh import of openaiClient
    
    // Clear the mock constructor before each test to reset call counts etc.
    mockOpenAIConstructor.mockClear();
    // Clear mocks on the instance methods if necessary (if they accumulate state across tests)
    mockOpenAIInstance.chat.completions.create.mockClear();
    mockOpenAIInstance.embeddings.create.mockClear();

    // Dynamically import the module under test AFTER mocks and env vars are set
    openaiClientModule = require('./openaiClient');
    // Reset the internal singleton instance in openaiClient.ts
    if (openaiClientModule.__TEST_ONLY_resetOpenAIClientInstance) {
      openaiClientModule.__TEST_ONLY_resetOpenAIClientInstance();
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw an error if OPENAI_API_KEY is missing', () => {
    delete process.env.OPENAI_API_KEY;
    // We need a fresh import of openaiClientModule here because its internal state might have been affected
    // by previous imports if not handled carefully with jest.resetModules() and __TEST_ONLY_reset...
    const freshClientModule = require('./openaiClient');
    if (freshClientModule.__TEST_ONLY_resetOpenAIClientInstance) {
        freshClientModule.__TEST_ONLY_resetOpenAIClientInstance();
    }

    try {
        freshClientModule.getOpenAIClient();
        throw new Error('Client initialized without API key, which should not happen.');
    } catch (error: any) {
        expect(error.message).toMatch(/OPENAI_API_KEY is not set/i);
    }
  });

  it('should initialize OpenAI client without errors if OPENAI_API_KEY is present', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key-present';
    // openaiClientModule is already freshly imported in beforeEach after resetModules
    // and its internal singleton is reset.
    
    let client;
    expect(() => {
      client = openaiClientModule.getOpenAIClient();
    }).not.toThrow();
    
    expect(client).toBeDefined();
    expect(mockOpenAIConstructor).toHaveBeenCalledTimes(1); 
    expect(mockOpenAIConstructor).toHaveBeenCalledWith({ apiKey: 'test-openai-key-present' });
  });

  it('should return the same client instance on subsequent calls', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key-singleton';
    // openaiClientModule is fresh from beforeEach

    const client1 = openaiClientModule.getOpenAIClient();
    expect(mockOpenAIConstructor).toHaveBeenCalledTimes(1); 

    const client2 = openaiClientModule.getOpenAIClient();
    expect(client1).toBe(client2);
    expect(mockOpenAIConstructor).toHaveBeenCalledTimes(1); 
  });
});