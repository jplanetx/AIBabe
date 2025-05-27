// Environment validation for Next.js application

// Load environment variables from .env file
require('dotenv').config();

/**
 * Checks for required environment variables at build/start time.
 * Add or adjust keys as needed for your app.
 */
function validateEnv() {
  const required = [
    'NODE_ENV',
    'OPENAI_API_KEY',
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PINECONE_API_KEY',
    'PINECONE_ENVIRONMENT',
    'PINECONE_INDEX_NAME'
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      "Missing required environment variables: " + missing.join(", ")
    );
  }
}

// Export the validateEnv function to be invoked explicitly when needed
module.exports = { validateEnv };
