/**
 * @jest-environment node
 */
import { POST } from './route'; // Adjust the import path as necessary
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    profile: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('API Route: /api/user/profile', () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = new PrismaClient();
    jest.clearAllMocks();
  });

  it('should create a new profile successfully', async () => {
    const userId = 'test-user-id-123';
    const email = 'test@example.com';

    prismaMock.profile.findUnique.mockResolvedValue(null); // No existing profile
    prismaMock.profile.create.mockResolvedValue({ id: userId, email, createdAt: new Date(), updatedAt: new Date() });

    const request = new NextRequest('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ userId, email }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toHaveProperty('id', userId);
    expect(responseBody).toHaveProperty('email', email);
    expect(prismaMock.profile.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    expect(prismaMock.profile.create).toHaveBeenCalledWith({ data: { id: userId, email } });
    expect(prismaMock.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('should return 400 if userId or email is missing', async () => {
    const request1 = new NextRequest('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }), // Missing userId
      headers: { 'Content-Type': 'application/json' },
    });
    const response1 = await POST(request1);
    const responseBody1 = await response1.json();
    expect(response1.status).toBe(400);
    expect(responseBody1.error).toBe('User ID and email are required');

    const request2 = new NextRequest('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ userId: 'test-user-id' }), // Missing email
      headers: { 'Content-Type': 'application/json' },
    });
    const response2 = await POST(request2);
    const responseBody2 = await response2.json();
    expect(response2.status).toBe(400);
    expect(responseBody2.error).toBe('User ID and email are required');
    expect(prismaMock.$disconnect).toHaveBeenCalledTimes(2); // Called in finally block for both requests
  });

  it('should return 200 and existing profile if profile already exists', async () => {
    const userId = 'existing-user-id';
    const email = 'existing@example.com';
    const existingProfileData = { id: userId, email, createdAt: new Date(), updatedAt: new Date() };

    prismaMock.profile.findUnique.mockResolvedValue(existingProfileData);

    const request = new NextRequest('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ userId, email }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(JSON.parse(JSON.stringify(existingProfileData))); // Compare JSON stringified versions due to Date objects
    expect(prismaMock.profile.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    expect(prismaMock.profile.create).not.toHaveBeenCalled();
    expect(prismaMock.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('should return 500 if Prisma throws an error during findUnique', async () => {
    const userId = 'error-user-id';
    const email = 'error@example.com';
    const errorMessage = "Database connection error";
    prismaMock.profile.findUnique.mockRejectedValue(new Error(errorMessage));

    const request = new NextRequest('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ userId, email }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Failed to create profile');
    expect(responseBody.details).toBe(errorMessage);
    expect(prismaMock.profile.create).not.toHaveBeenCalled();
    expect(prismaMock.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('should return 500 if Prisma throws an error during create', async () => {
    const userId = 'create-error-user-id';
    const email = 'create-error@example.com';
    const errorMessage = "Failed to insert record";

    prismaMock.profile.findUnique.mockResolvedValue(null); // No existing profile
    prismaMock.profile.create.mockRejectedValue(new Error(errorMessage));

    const request = new NextRequest('http://localhost/api/user/profile', {
      method: 'POST',
      body: JSON.stringify({ userId, email }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Failed to create profile');
    expect(responseBody.details).toBe(errorMessage);
    expect(prismaMock.$disconnect).toHaveBeenCalledTimes(1);
  });
});