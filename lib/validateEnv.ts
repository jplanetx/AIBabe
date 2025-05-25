console.log('VALIDATE_ENV_TS_VERSION_MARKER_12345'); // Unique marker
// lib/validateEnv.ts

// Define required and optional environment variables
const requiredEnv = [
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
const optionalEnv = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_WEBSOCKET_URL'
];

// Function to perform the validation
export function validateEnv() {
  console.log('VALIDATE_ENV_TS_FUNCTION_CALLED_MARKER'); // New marker for function call
  requiredEnv.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });
  // If no error is thrown, validation passed.
  // console.log('Environment variables validated successfully.'); // Optional: log success
}

// Run validation on module load for the application
validateEnv();