// Minimal CommonJS environment validation for Next.js config

/**
 * Checks for required environment variables at build/start time.
 * Add or adjust keys as needed for your app.
 */
function validateEnv() {
  const required = [
    // Example: add your required env vars here
    "DATABASE_URL",
    "NEXT_PUBLIC_API_URL"
    // Add more as needed
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      "Missing required environment variables: " + missing.join(", ")
    );
  }
}

module.exports = { validateEnv };