/**
 * @jest-environment node
 */
import { Pinecone } from '@pinecone-database/pinecone';
// Assuming the client instance is exported, or a function that returns it.
// Let's assume an init function or direct export for now.
// Modify the import based on actual export from pineconeClient.ts
import { getPineconeClient } from './pineconeClient'; // Or: import pineconeClient from './pineconeClient';
let getPineconeClientModule: typeof import('./pineconeClient');
let FreshPineconeConstructorMock: jest.Mock;

jest.mock('@pinecone-database/pinecone', () => {
  // Mock the Pinecone class constructor and its methods
  const mockIndex = {
    namespace: jest.fn().mockReturnThis(), // Mock namespace method
    // Add other methods like upsert, query, etc., if they are called during initialization or basic checks
  };
  const mockInit = jest.fn();
  const mockCreateIndex = jest.fn();
  const mockDescribeIndex = jest.fn().mockResolvedValue({ name: 'test-index', status: { ready: true } });
  const mockListIndexes = jest.fn().mockResolvedValue({ indexes: [] }); // ADDED
  const mockIndexMethod = jest.fn(() => mockIndex);

  return {
    Pinecone: jest.fn().mockImplementation(() => ({
      init: mockInit,
      index: mockIndexMethod,
      createIndex: mockCreateIndex,
      describeIndex: mockDescribeIndex,
      listIndexes: mockListIndexes, // ADDED
      // Add any other methods of PineconeClient that might be used
    })),
  };
});

let originalEnv: any;
let newMockInit: jest.Mock;
let pineconeClientModule: typeof import('./pineconeClient');

describe('Pinecone Client Initialization (lib/pineconeClient.ts)', () => {
beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    
    // Set default environment variables
    Object.assign(process.env, {
      PINECONE_API_KEY: 'test-pinecone-key',
      PINECONE_ENVIRONMENT: 'test-pinecone-environment',
      PINECONE_INDEX_NAME: 'test-pinecone-index-main'
    });

    // Reset the singleton instance
    const module = require('./pineconeClient');
    if (module.__TEST_ONLY_resetPineconeClientInstance) {
      module.__TEST_ONLY_resetPineconeClientInstance();
    }

    getPineconeClientModule = require('./pineconeClient');
    // The premature }); from original line 59 was removed by this diff.
    // Mock functions are initialized here for each test run and captured by the jest.doMock factory.
    // 'newMockInit' is a 'let' declared at line 37; it's reassigned here for test isolation.
    newMockInit = jest.fn();
    const localNewMockCreateIndex = jest.fn(); // These are local to this beforeEach scope
    const localNewMockDescribeIndex = jest.fn().mockResolvedValue({ name: 'test-index', status: { ready: true } });
    const localNewMockListIndexes = jest.fn().mockResolvedValue({ indexes: [] });
    const localNewMockIndexObject = {
      namespace: jest.fn().mockReturnThis(),
    };
    const localNewMockIndexMethod = jest.fn().mockImplementation(() => localNewMockIndexObject);
    
    jest.doMock('@pinecone-database/pinecone', () => {
      // This factory function is called by Jest to create the mock for '@pinecone-database/pinecone'.
      // It uses the mock functions (newMockInit, localNewMock*) defined in the beforeEach scope.
      const constructorMockImpl = jest.fn().mockImplementation(() => ({
        init: newMockInit, // Uses the newMockInit from beforeEach's scope (reassigned above)
        index: localNewMockIndexMethod,
        createIndex: localNewMockCreateIndex,
        describeIndex: localNewMockDescribeIndex,
        listIndexes: localNewMockListIndexes,
      }));
      return { Pinecone: constructorMockImpl };
    });
    // The extraneous }); from original line 78 was removed as part of this replacement.
    // The code that was originally from line 79 onwards will now correctly follow inside the beforeEach.

    // Now require the mock to get the fresh constructor instance for assertions
    FreshPineconeConstructorMock = require('@pinecone-database/pinecone').Pinecone;
    // FreshPineconeConstructorMock.mockClear(); // Not strictly needed as it's a new fn from doMock

    // Call the test-only reset function for the SUT
    const tempPineconeClientModule = require('./pineconeClient');
    if (tempPineconeClientModule.__TEST_ONLY_resetPineconeClientInstance) {
      tempPineconeClientModule.__TEST_ONLY_resetPineconeClientInstance();
    }
    
    // Require the SUT
    getPineconeClientModule = require('./pineconeClient');
    
    // Clear mocks on the instance if necessary
    // This part targets methods of the instance returned by the constructor,
    // which might be less critical if the primary focus is constructor calls.
    const mockInstance = FreshPineconeConstructorMock.mock.instances[0];
    if (mockInstance) {
        if (mockInstance.init && typeof mockInstance.init.mockClear === 'function') mockInstance.init.mockClear();
        if (mockInstance.index && typeof mockInstance.index.mockClear === 'function') mockInstance.index.mockClear();
        if (mockInstance.createIndex && typeof mockInstance.createIndex.mockClear === 'function') mockInstance.createIndex.mockClear();
        if (mockInstance.listIndexes && typeof mockInstance.listIndexes.mockClear === 'function') mockInstance.listIndexes.mockClear();
        if (mockInstance.describeIndex && typeof mockInstance.describeIndex.mockClear === 'function') mockInstance.describeIndex.mockClear();
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw an error if PINECONE_API_KEY is missing', () => {
    delete process.env.PINECONE_API_KEY;
    process.env.PINECONE_ENVIRONMENT = 'test-env';
    // PINECONE_INDEX_NAME is not required for getPineconeClient itself
    
    expect(() => getPineconeClientModule.getPineconeClient()).toThrowError(/PINECONE_API_KEY is not set/i);
  });

  it('should NOT throw an error from getPineconeClient if PINECONE_ENVIRONMENT is missing (now checked in setupPineconeIndex)', () => {
    process.env.PINECONE_API_KEY = 'test-key-env-check'; // Ensure API key is set for this specific check
    delete process.env.PINECONE_ENVIRONMENT;

    // Check that getPineconeClient itself doesn't throw for missing PINECONE_ENVIRONMENT
    expect(() => getPineconeClientModule.getPineconeClient()).not.toThrowError(/PINECONE_ENVIRONMENT is not set/i);
    // More general check that it doesn't throw at all if API key is present
    expect(() => getPineconeClientModule.getPineconeClient()).not.toThrow();
  });
  
  it('should NOT throw an error from getPineconeClient if only PINECONE_INDEX_NAME is missing', () => {
    process.env.PINECONE_API_KEY = 'test-key';
    process.env.PINECONE_ENVIRONMENT = 'test-env';
    delete process.env.PINECONE_INDEX_NAME;
    
    expect(() => getPineconeClientModule.getPineconeClient()).not.toThrow();
  });

  it('should initialize Pinecone client without errors if API key and environment are present', () => {
    process.env.PINECONE_API_KEY = 'test-pinecone-key';
    process.env.PINECONE_ENVIRONMENT = 'test-pinecone-environment';
    // PINECONE_INDEX_NAME is not strictly needed for getPineconeClient, but good to have for completeness
    process.env.PINECONE_INDEX_NAME = 'test-pinecone-index';


    let client;
    expect(() => {
      client = getPineconeClientModule.getPineconeClient();
    }).not.toThrow();
    
    expect(client).toBeDefined();
    expect(FreshPineconeConstructorMock).toHaveBeenCalledTimes(1);
    expect(FreshPineconeConstructorMock).toHaveBeenCalledWith({
      apiKey: 'test-pinecone-key'
      // environment is not passed to constructor directly
    });
  });
  
  it('should return the same client instance on subsequent calls', () => {
    process.env.PINECONE_API_KEY = 'test-pinecone-key-singleton';
    process.env.PINECONE_ENVIRONMENT = 'test-pinecone-env-singleton';

    const client1 = getPineconeClientModule.getPineconeClient();
    expect(FreshPineconeConstructorMock).toHaveBeenCalledTimes(1);

    const client2 = getPineconeClientModule.getPineconeClient();
    expect(client1).toBe(client2);
    expect(FreshPineconeConstructorMock).toHaveBeenCalledTimes(1); // Constructor still called only once
  });

  it('should not throw an error from getPineconeClient if COINBASE_API_KEY (irrelevant) is missing, but Pinecone vars are present', () => {
    process.env.PINECONE_API_KEY = 'test-pinecone-key';
    process.env.PINECONE_ENVIRONMENT = 'test-pinecone-environment';
    process.env.PINECONE_INDEX_NAME = 'test-pinecone-index'; // Though not used by getPineconeClient
    delete process.env.COINBASE_API_KEY;

    let client;
    expect(() => {
      client = getPineconeClientModule.getPineconeClient();
    }).not.toThrow();
    expect(client).toBeDefined();
    expect(FreshPineconeConstructorMock).toHaveBeenCalledTimes(1);
  });
});

let createPineconeMock = (overrides = {}) => {
  const defaultMock = {
    init: jest.fn(),
    index: jest.fn().mockReturnValue({
      namespace: jest.fn().mockReturnThis(),
    }),
    createIndex: jest.fn(),
    describeIndex: jest.fn().mockResolvedValue({ 
      name: 'test-index', 
      status: { ready: true } 
    }),
    listIndexes: jest.fn().mockResolvedValue({ indexes: [] }),
  };
  
  return jest.fn().mockImplementation(() => ({
    ...defaultMock,
    ...overrides
  }));
};

describe('Pinecone Index Setup (lib/pineconeClient.ts - setupPineconeIndex)', () => {
  let originalEnv: any;
  let newMockInit: jest.Mock;
  let pineconeClientModule: typeof import('./pineconeClient');
  let mockPineconeInstance: any;
  let mockListIndexesFn: jest.Mock;
  let mockCreateIndexFn: jest.Mock;
  let mockDescribeIndexFn: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    originalEnv = { ...process.env };
    process.env = { ...originalEnv };
    
    mockListIndexesFn = jest.fn();
    mockCreateIndexFn = jest.fn();
    mockDescribeIndexFn = jest.fn();
    
    jest.doMock('@pinecone-database/pinecone', () => ({
      Pinecone: createPineconeMock({
        listIndexes: mockListIndexesFn,
        createIndex: mockCreateIndexFn,
        describeIndex: mockDescribeIndexFn,
      })
    }));
    Object.assign(process.env, {
      PINECONE_API_KEY: 'test-pinecone-key',
      PINECONE_ENVIRONMENT: 'test-pinecone-environment',
      PINECONE_INDEX_NAME: 'test-pinecone-index-main'
    });

    // Reset the singleton instance
    const module = require('./pineconeClient');
    if (module.__TEST_ONLY_resetPineconeClientInstance) {
      module.__TEST_ONLY_resetPineconeClientInstance();
    }

    pineconeClientModule = require('./pineconeClient');
   });
  it('should throw if PINECONE_INDEX_NAME is missing for setupPineconeIndex', async () => {
    // Ensure PINECONE_INDEX_NAME is undefined for this specific test,
    // overriding the value set in beforeEach.
    delete process.env.PINECONE_INDEX_NAME;

    // getPineconeClient will succeed here because API key and ENV are set in beforeEach
    // and it doesn't require PINECONE_INDEX_NAME.
    // This call ensures the pinecone client instance is created using the mocks.
    pineconeClientModule.getPineconeClient();
    
    // Now test setupPineconeIndex, which *does* require PINECONE_INDEX_NAME
    await expect(pineconeClientModule.setupPineconeIndex()).rejects.toThrow(/PINECONE_INDEX_NAME environment variable is not set/i);
  });

  it('should create index if it does not exist', async () => {
    process.env.PINECONE_API_KEY = 'test-key';
    process.env.PINECONE_ENVIRONMENT = 'test-env';
    process.env.PINECONE_INDEX_NAME = 'new-test-index';

    mockListIndexesFn.mockClear();
    mockCreateIndexFn.mockClear();
    mockListIndexesFn.mockResolvedValue({ indexes: [{ name: 'existing-index' }] });

    await pineconeClientModule.setupPineconeIndex();

    expect(mockListIndexesFn).toHaveBeenCalled();
    expect(mockCreateIndexFn).toHaveBeenCalledWith(expect.objectContaining({
      name: 'new-test-index',
      dimension: 1536,
      metric: 'cosine',
    }));
  });

  it('should not attempt to create index if it already exists', async () => {
    process.env.PINECONE_API_KEY = 'test-key';
    process.env.PINECONE_ENVIRONMENT = 'test-env';
    process.env.PINECONE_INDEX_NAME = 'existing-index';

    mockListIndexesFn.mockResolvedValue({ indexes: [{ name: 'existing-index' }] });

    await pineconeClientModule.setupPineconeIndex();

    expect(mockListIndexesFn).toHaveBeenCalled();
    expect(mockCreateIndexFn).not.toHaveBeenCalled();
  });

  it('should throw an error during index creation if PINECONE_ENVIRONMENT is missing', async () => {
    process.env.PINECONE_API_KEY = 'test-pinecone-key-env-setup';
    process.env.PINECONE_INDEX_NAME = 'env-missing-test-index';
    delete process.env.PINECONE_ENVIRONMENT;

    // Ensure getPineconeClient is called so it can be (re)initialized with the new env
    // and that the mockPineconeInstance is correctly configured by the beforeEach
    // This might require re-fetching pineconeClientModule if env changes affect its top-level execution
    // However, pineconeClientModule is already loaded in beforeEach.
    // The critical part is that initializePineconeClient() within getPineconeClient() uses the current process.env
    
    // Mock listIndexes to simulate index not existing, forcing creation attempt
    mockListIndexesFn.mockResolvedValue({ indexes: [] });

    await expect(pineconeClientModule.setupPineconeIndex()).rejects.toThrowError(
      /PINECONE_ENVIRONMENT is not set, required for index spec./i
    );
  });
  it('should successfully describe the index after setup', async () => {
    const testIndexName = 'describe-test-index';
    process.env.PINECONE_API_KEY = 'test-key-describe';
    process.env.PINECONE_ENVIRONMENT = 'test-env-describe';
    process.env.PINECONE_INDEX_NAME = testIndexName;

    // Simulate index not existing initially, so createIndex is called
    mockListIndexesFn.mockResolvedValue({ indexes: [] });
    // Ensure describeIndex mock is set up for this specific instance
    mockDescribeIndexFn.mockResolvedValue({
        name: testIndexName,
        status: { ready: true },
        dimension: 1536,
        metric: 'cosine',
        host: `${testIndexName}-somehash.svc.${process.env.PINECONE_ENVIRONMENT}.pinecone.io`,
        spec: {
            pod: {
                environment: process.env.PINECONE_ENVIRONMENT,
                podType: 'p1.x1',
                pods: 1,
                replicas: 1,
                shards: 1,
            }
        },
    });


    await pineconeClientModule.setupPineconeIndex();

    // Get the client (which should be the mocked one)
    const client = pineconeClientModule.getPineconeClient();
    
    // Now, test describeIndex
    const description = await client.describeIndex(testIndexName);

    expect(mockDescribeIndexFn).toHaveBeenCalledWith(testIndexName);
    expect(description).toBeDefined();
    expect(description.name).toBe(testIndexName);
    expect(description.status?.ready).toBe(true);
    expect(description.dimension).toBe(1536);
  });
}); // Closes the describe block for 'Pinecone Index Setup'
