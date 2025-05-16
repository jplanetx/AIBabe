// app/api/health/route.ts

import { NextResponse } from 'next/server';

/**
 * Health check endpoint.
 * Responds to GET requests with a simple JSON status.
 * Useful for uptime monitoring and deployment checks.
 */
export async function GET() {
  // Return a JSON response with status "ok" and HTTP 200
  return NextResponse.json({ status: 'ok' });
}