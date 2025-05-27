'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setIsLoading(true);
    console.log('Attempting login via API with:', { email, password });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle errors from the API route
        const errorDetails = data.details ? JSON.stringify(data.details) : data.error;
        setMessage(`Login failed: ${errorDetails || response.statusText}`);
        console.error('Login error from API:', data);
      } else {
        setMessage(data.message || 'Login successful!');
        console.log('Login successful via API, user:', data.user);
        // Redirect to chat page on successful login
        router.refresh(); // This will re-fetch server components and update based on new cookie
        router.push('/chat'); // Redirect to chat instead of dashboard
      }
    } catch (error) {
      console.error('Network or other error during login:', error);
      setMessage('Login failed due to a network or unexpected error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleLogin} className="max-w-400 mx-auto p-8 bg-white bg-opacity-5 rounded-xl backdrop-blur-lg border border-white border-opacity-10">
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 font-medium text-white text-sm">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full p-3 mt-2 border-2 border-white border-opacity-20 rounded-lg bg-white bg-opacity-10 text-white text-base transition-all duration-300 ease-in-out focus:outline-none focus:border-pink-500 focus:bg-white focus:bg-opacity-15 focus:shadow-lg placeholder-white placeholder-opacity-60"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 font-medium text-white text-sm">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full p-3 mt-2 border-2 border-white border-opacity-20 rounded-lg bg-white bg-opacity-10 text-white text-base transition-all duration-300 ease-in-out focus:outline-none focus:border-pink-500 focus:bg-white focus:bg-opacity-15 focus:shadow-lg placeholder-white placeholder-opacity-60"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full p-4 mt-4 bg-gradient-to-r from-pink-500 to-pink-700 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 hover:from-pink-700 hover:to-pink-900 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin inline-block"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
          
          {message && (
            <p className={`mt-4 text-center ${message.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </p>
          )}
          
          <div className="mt-4 text-center space-y-2">
            <p className="text-gray-300 text-sm">
              <Link 
                href="/auth/reset-password" 
                className="text-pink-400 no-underline font-medium hover:underline"
              >
                Forgot your password?
              </Link>
            </p>
            <p className="text-gray-300 text-sm">
              Don't have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="text-pink-400 no-underline font-medium hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
