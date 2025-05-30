import { createServerClient } from '@supabase/ssr';
// import { env } from '@/lib/validateEnv'; // Assuming you have env validation - Removed as not used and validateEnv doesn't export 'env'
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers'; // Mock if needed, or adapt for server-side client

// Initialize Prisma Client
const prisma = new PrismaClient();

// Helper to create a Supabase client for tests
// This might need adjustment based on your actual Supabase client setup for tests
// For server-side tests, you might use the service role key for direct DB manipulation for cleanup.
const createTestSupabaseClient = () => {
  // For tests, using service_role key allows bypassing RLS for cleanup if necessary
  // Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in your .env.test or similar
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase URL or Service Role Key not configured for tests.');
  }
  // This is a generic way to create a client; adapt if you have a specific test setup
  // For auth operations like signUp, you typically use the anon key.
  // For admin operations like deleting users directly, you'd use the service_role key.
  // We'll use anon key for signup and service_role for cleanup.
  
  // Client for auth operations (signup)
  const supabaseAuthClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ANON key for signUp
    {
      cookies: {
        get: (name: string) => undefined, // Mock cookies for server client if not in Next.js context
        set: (name: string, value: string, options: any) => {},
        remove: (name: string, options: any) => {},
      },
    }
  );

  // Client for admin operations (cleanup) - using service role
  const supabaseAdminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // SERVICE_ROLE key for admin actions
     {
      cookies: {
        get: (name: string) => undefined,
        set: (name: string, value: string, options: any) => {},
        remove: (name: string, options: any) => {},
      },
    }
  );

  return { supabaseAuthClient, supabaseAdminClient };
};


describe('Profile Creation on User Signup - Integration Test', () => {
  let supabaseAuthClient: ReturnType<typeof createServerClient>;
  let supabaseAdminClient: ReturnType<typeof createServerClient>;
  let createdUserId: string | null = null;
  let userEmail: string;

  beforeAll(() => {
    const clients = createTestSupabaseClient();
    supabaseAuthClient = clients.supabaseAuthClient;
    supabaseAdminClient = clients.supabaseAdminClient;
  });

  afterEach(async () => {
    // Cleanup: Delete the user from auth.users and the profile from public.profiles
    if (createdUserId) {
      try {
        // Attempt to delete from public.profiles first
        // The trigger should prevent re-creation if user still exists, but good to be thorough
        await prisma.profile.delete({ where: { id: createdUserId } }).catch(() => {});
      } catch (error) {
        // console.warn(`Warning: Could not delete profile ${createdUserId} during cleanup:`, error);
      }
      
      try {
        // Delete the user from auth.users using the admin client
        const { error: adminDeleteError } = await supabaseAdminClient.auth.admin.deleteUser(createdUserId);
        if (adminDeleteError) {
          // console.warn(`Warning: Could not delete auth user ${createdUserId} during cleanup:`, adminDeleteError.message);
        }
      } catch (error) {
        // console.warn(`Warning: Error during auth user deletion for ${createdUserId}:`, error);
      }
      
      createdUserId = null;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create a profile in public.profiles when a new user signs up', async () => {
    userEmail = `testuser_${Date.now()}@example.com`;
    const password = 'password123';

    // 1. Register a new user
    const { data: signUpData, error: signUpError } = await supabaseAuthClient.auth.signUp({
      email: userEmail,
      password: password,
    });
    
    expect(signUpError).toBeNull();
    expect(signUpData).toBeDefined();
    expect(signUpData.user).toBeDefined();
    expect(signUpData.user?.id).toBeDefined();
    expect(signUpData.user?.email).toBe(userEmail);

    createdUserId = signUpData.user!.id; // Save for cleanup
    expect(createdUserId).toBeDefined(); // Ensure createdUserId is set

    // 2. Verify the profile entry was created in public.profiles
    // Add a small delay to allow the trigger to fire and commit
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

    // Ensure createdUserId is not null before querying
    if (!createdUserId) {
      throw new Error('Test setup failed: createdUserId is null after signup.');
    }

    const profile = await prisma.profile.findUnique({
      where: { id: createdUserId },
    });

    expect(profile).not.toBeNull();
    expect(profile?.id).toBe(createdUserId);
    expect(profile?.email).toBe(userEmail);
    expect(profile?.createdAt).toBeInstanceOf(Date);
    expect(profile?.updatedAt).toBeInstanceOf(Date);

  }, 20000); // Increase timeout for integration test involving DB operations
});