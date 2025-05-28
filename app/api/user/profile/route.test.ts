/**
 * @jest-environment node
 */
import { POST } from '@/app/api/user/profile/route';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { createServerClient } from '@supabase/ssr';

// Mock dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userProfile: {
      upsert: jest.fn(),
    },
  },
}));

const mockCookiesGet = jest.fn();
const mockCookiesSet = jest.fn();
const mockSupabaseAuthGetUser = jest.fn();
const mockSupabaseClient = {
  auth: {
    getUser: mockSupabaseAuthGetUser,
  },
};

describe('POST /api/user/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockReturnValue({
      get: mockCookiesGet,
      set: mockCookiesSet,
    });
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockSupabaseAuthGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });

    const request = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ firstName: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const responseBody = await response.json();

    expect(response.status).toBe(401);
    expect(responseBody.error).toBe('Unauthorized');
  });

  it('should return 400 if request body is not valid JSON', async () => {
    mockSupabaseAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-id-123', email: 'test@example.com' } }, error: null });
    const request = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Invalid request body: Not JSON');
  });

  it('should return 400 if request body validation fails', async () => {
    mockSupabaseAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-id-123', email: 'test@example.com' } }, error: null });
    const request = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ unexpectedField: 'test' }), // Zod schema is strict
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Invalid input');
    expect(responseBody.details).toBeDefined();
  });

  it('should create a User and UserProfile if they do not exist and return 201', async () => {
    const mockUser = { id: 'user-id-new', email: 'new@example.com' };
    const profileData = { firstName: 'New', lastName: 'User', bio: 'A new bio' };
    mockSupabaseAuthGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    (db.user.findUnique as jest.Mock).mockResolvedValue(null); // User does not exist
    (db.user.create as jest.Mock).mockResolvedValue({ id: mockUser.id, email: mockUser.email });
    (db.userProfile.upsert as jest.Mock).mockResolvedValue({
      userId: mockUser.id,
      profileData: JSON.stringify(profileData),
      // ... other fields
    });

    const request = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody.message).toBe('Profile created/updated successfully');
    expect(responseBody.profile).toEqual(profileData);
    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { id: mockUser.id } });
    expect(db.user.create).toHaveBeenCalledWith({ data: { id: mockUser.id, email: mockUser.email } });
    expect(db.userProfile.upsert).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
      update: { profileData: JSON.stringify(profileData), lastUpdated: expect.any(Date) },
      create: { userId: mockUser.id, profileData: JSON.stringify(profileData) },
    });
  });

  it('should update UserProfile if User exists and return 201', async () => {
    const mockUser = { id: 'user-id-existing', email: 'existing@example.com' };
    const profileData = { firstName: 'Existing', lastName: 'User', bio: 'Updated bio' };
    mockSupabaseAuthGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    (db.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUser.id, email: mockUser.email }); // User exists
    (db.userProfile.upsert as jest.Mock).mockResolvedValue({
      userId: mockUser.id,
      profileData: JSON.stringify(profileData),
      // ... other fields
    });

    const request = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody.message).toBe('Profile created/updated successfully');
    expect(responseBody.profile).toEqual(profileData);
    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { id: mockUser.id } });
    expect(db.user.create).not.toHaveBeenCalled();
    expect(db.userProfile.upsert).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
      update: { profileData: JSON.stringify(profileData), lastUpdated: expect.any(Date) },
      create: { userId: mockUser.id, profileData: JSON.stringify(profileData) },
    });
  });

  it('should return 500 if Prisma user.findUnique throws an error', async () => {
    mockSupabaseAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-id-error', email: 'error@example.com' } }, error: null });
    (db.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database findUnique error'));

    const request = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ firstName: 'Error' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('An unexpected server error occurred.');
  });

  it('should return 500 if Prisma user.create throws an error', async () => {
    mockSupabaseAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-id-error-create', email: 'errorcreate@example.com' } }, error: null });
    (db.user.findUnique as jest.Mock).mockResolvedValue(null);
    (db.user.create as jest.Mock).mockRejectedValue(new Error('Database create error'));
    
    const request = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ firstName: 'ErrorCreate' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('An unexpected server error occurred.');
  });

  it('should return 500 if Prisma userProfile.upsert throws an error', async () => {
    mockSupabaseAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-id-error-upsert', email: 'errorupsert@example.com' } }, error: null });
    (db.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-id-error-upsert', email: 'errorupsert@example.com' });
    (db.userProfile.upsert as jest.Mock).mockRejectedValue(new Error('Database upsert error'));

    const request = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ firstName: 'ErrorUpsert' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('An unexpected server error occurred.');
  });
});