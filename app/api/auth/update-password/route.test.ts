/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
  })),
}));

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

describe('/api/auth/update-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update password for authenticated user', async () => {
    const { createServerClient } = require('@supabase/ssr');
    const mockGetUser = jest.fn().mockResolvedValue({ 
      data: { user: { id: 'user-123', email: 'test@example.com' } }, 
      error: null 
    });
    const mockUpdateUser = jest.fn().mockResolvedValue({ error: null });
    
    createServerClient.mockReturnValue({
      auth: {
        getUser: mockGetUser,
        updateUser: mockUpdateUser,
      },
    });

    const request = new NextRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ 
        password: 'newpassword123', 
        confirmPassword: 'newpassword123' 
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Password updated successfully. You can now log in with your new password.');
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
  });

  it('should return error for unauthenticated user', async () => {
    const { createServerClient } = require('@supabase/ssr');
    const mockGetUser = jest.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: { message: 'No user found' } 
    });
    
    createServerClient.mockReturnValue({
      auth: {
        getUser: mockGetUser,
        updateUser: jest.fn(),
      },
    });

    const request = new NextRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ 
        password: 'newpassword123', 
        confirmPassword: 'newpassword123' 
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid or expired reset link. Please request a new password reset.');
  });

  it('should return error for mismatched passwords', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ 
        password: 'newpassword123', 
        confirmPassword: 'differentpassword' 
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details.confirmPassword).toContain("Passwords don't match");
  });

  it('should return error for short password', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ 
        password: 'short', 
        confirmPassword: 'short' 
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details.password).toContain('Password must be at least 8 characters long');
  });

  it('should return error for missing fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password: 'newpassword123' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
  });

  it('should handle Supabase update errors', async () => {
    const { createServerClient } = require('@supabase/ssr');
    const mockGetUser = jest.fn().mockResolvedValue({ 
      data: { user: { id: 'user-123', email: 'test@example.com' } }, 
      error: null 
    });
    const mockUpdateUser = jest.fn().mockResolvedValue({ 
      error: { message: 'Password update failed', status: 500 } 
    });
    
    createServerClient.mockReturnValue({
      auth: {
        getUser: mockGetUser,
        updateUser: mockUpdateUser,
      },
    });

    const request = new NextRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ 
        password: 'newpassword123', 
        confirmPassword: 'newpassword123' 
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to update password. Please try again.');
  });

  it('should return error for invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: 'invalid json',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request body: Not JSON');
  });
});
