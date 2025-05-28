/**
 * @jest-environment node
 */

// We import the function to test its direct invocation, but the primary validation
// happens on module load, so we'll use require() inside tests for that.
// import { validateEnv as runValidateEnvFunctionAfterImport } from './validateEnv'; // Removed top-level import

describe('Environment Variable Validation (lib/validateEnv.ts)', () => {
  const originalEnv = { ...process.env };
  let validateEnvModule: typeof import('./validateEnv');

  beforeEach(() => {
    jest.resetModules(); // This is key to re-run module-level code (the validation)
    process.env = { ...originalEnv }; // Restore original env before each test
    validateEnvModule = require('./validateEnv'); // Re-require after reset
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original env after all tests
  });

  // Variables currently REQUIRED by lib/validateEnv.ts
  const currentlyRequiredByScript = [
    'NODE_ENV',
    'OPENAI_API_KEY',
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PINECONE_API_KEY',
    'PINECONE_ENVIRONMENT',
    'PINECONE_INDEX_NAME',
  ];

  currentlyRequiredByScript.forEach(varName => {
    it(`should throw an error if currently required environment variable ${varName} is missing`, () => {
      delete process.env[varName];
      // Regex to match "Missing required environment variables: " and ensure varName is in the list.
      // Allows for other variables to also be in the list.
      const patternString = `Missing required environment variables:.*${varName}`;
      const expectedErrorRegex = new RegExp(patternString);
      // Test the exported function directly
      expect(() => validateEnvModule.validateEnv()).toThrowError(expectedErrorRegex);
    });
  });

  it('should NOT throw an error if all currently required environment variables are present', () => {
    currentlyRequiredByScript.forEach(varName => {
      process.env[varName] = `test-value-for-${varName}`;
    });
    
    // Test the exported function directly
    expect(() => validateEnvModule.validateEnv()).not.toThrow();
  });

  it('SHOULD NOT throw an error if COINBASE_API_KEY (now irrelevant) is missing', () => {
    // Set all *currently* required vars
    currentlyRequiredByScript.forEach(varName => {
      process.env[varName] = `test-value-for-${varName}`;
    });
    delete process.env.COINBASE_API_KEY; // Ensure it's not set
    
    // Test the exported function directly
    expect(() => validateEnvModule.validateEnv()).not.toThrow();
  });
  
  it('SHOULD NOT throw an error if CDP_API_KEY (now irrelevant) is missing', () => {
    // Set all *currently* required vars
    currentlyRequiredByScript.forEach(varName => {
      process.env[varName] = `test-value-for-${varName}`;
    });
    delete process.env.CDP_API_KEY; // Ensure it's not set
    
    // Test the exported function directly
    expect(() => validateEnvModule.validateEnv()).not.toThrow();
  });

  it('should NOT throw if a non-listed optional/irrelevant var (e.g. NEXT_PUBLIC_GTM_ID) is missing, given required ones are set', () => {
    currentlyRequiredByScript.forEach(varName => {
      process.env[varName] = `test-value-for-${varName}`;
    });
    delete process.env.NEXT_PUBLIC_GTM_ID; // Example of a var not in the script's required list

    // Test the exported function directly
    expect(() => validateEnvModule.validateEnv()).not.toThrow();
  });

  it('should make available the valid environment variables on process.env after successful validation', () => {
    const testValues: Record<string, string> = {};
    currentlyRequiredByScript.forEach(varName => {
      testValues[varName] = `live-value-${varName}`;
      process.env[varName] = testValues[varName];
    });
    process.env.ANOTHER_OPTIONAL_VAR = 'optional_test_value';
    testValues.ANOTHER_OPTIONAL_VAR = 'optional_test_value';

    validateEnvModule.validateEnv(); // This executes the validation via the imported module

    currentlyRequiredByScript.forEach(varName => {
        expect(process.env[varName]).toBe(testValues[varName]);
      });
    expect(process.env.ANOTHER_OPTIONAL_VAR).toBe(testValues.ANOTHER_OPTIONAL_VAR);
  });
  
  // Test for newly added required variables (these were previously tested as "not to throw")
  it('SHOULD throw an error if PINECONE_API_KEY is missing', () => {
    currentlyRequiredByScript.forEach(varName => {
      if (varName !== 'PINECONE_API_KEY') {
        process.env[varName] = `test-value-for-${varName}`;
      }
    });
    delete process.env.PINECONE_API_KEY;
    const expectedErrorRegex = /Missing required environment variables:.*PINECONE_API_KEY/;
    // Test the exported function directly
    expect(() => validateEnvModule.validateEnv()).toThrowError(expectedErrorRegex);
  });

   it('SHOULD throw an error if PINECONE_INDEX_NAME is missing', () => {
    currentlyRequiredByScript.forEach(varName => {
      if (varName !== 'PINECONE_INDEX_NAME') {
        process.env[varName] = `test-value-for-${varName}`;
      }
    });
    delete process.env.PINECONE_INDEX_NAME;
    const expectedErrorRegex = /Missing required environment variables:.*PINECONE_INDEX_NAME/;
    // Test the exported function directly
    expect(() => validateEnvModule.validateEnv()).toThrowError(expectedErrorRegex);
  });

   it('SHOULD throw an error if PINECONE_ENVIRONMENT is missing', () => {
    currentlyRequiredByScript.forEach(varName => {
      if (varName !== 'PINECONE_ENVIRONMENT') {
        process.env[varName] = `test-value-for-${varName}`;
      }
    });
    delete process.env.PINECONE_ENVIRONMENT;
    const expectedErrorRegex = /Missing required environment variables:.*PINECONE_ENVIRONMENT/;
    // Test the exported function directly
    expect(() => validateEnvModule.validateEnv()).toThrowError(expectedErrorRegex);
  });

   it('SHOULD throw an error if NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    currentlyRequiredByScript.forEach(varName => {
      if (varName !== 'NEXT_PUBLIC_SUPABASE_URL') {
        process.env[varName] = `test-value-for-${varName}`;
      }
    });
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const expectedErrorRegex = /Missing required environment variables:.*NEXT_PUBLIC_SUPABASE_URL/;
    // Test the exported function directly
    expect(() => validateEnvModule.validateEnv()).toThrowError(expectedErrorRegex);
  });

   it('SHOULD throw an error if NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    currentlyRequiredByScript.forEach(varName => {
      if (varName !== 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
        process.env[varName] = `test-value-for-${varName}`;
      }
    });
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const expectedErrorRegex = /Missing required environment variables:.*NEXT_PUBLIC_SUPABASE_ANON_KEY/;
    // Test the exported function directly
    expect(() => validateEnvModule.validateEnv()).toThrowError(expectedErrorRegex);
  });

   it('SHOULD throw an error if SUPABASE_SERVICE_ROLE_KEY is missing', () => {
    currentlyRequiredByScript.forEach(varName => {
      if (varName !== 'SUPABASE_SERVICE_ROLE_KEY') {
        process.env[varName] = `test-value-for-${varName}`;
      }
    });
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const expectedErrorRegex = /Missing required environment variables:.*SUPABASE_SERVICE_ROLE_KEY/;
    // Test the exported function directly
    expect(() => validateEnvModule.validateEnv()).toThrowError(expectedErrorRegex);
  });
});