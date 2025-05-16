// lib/validateEnv.ts

// Define required and optional environment variables
const requiredEnv = [
  'NODE_ENV',
  'OPENAI_API_KEY',
  'DATABASE_URL',
  'COINBASE_API_KEY',
  'CDP_API_KEY'
];
const optionalEnv = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_WEBSOCKET_URL'
];

// Validate that all required variables are set
requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// A simple exported function to trigger validation at startup
export function validateEnv() {
  console.log('Environment variables validated.');
}