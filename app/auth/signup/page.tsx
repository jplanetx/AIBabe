// app/auth/signup/page.tsx
'use client';

import React, { useState } from 'react';
// import { createClient } from '@/lib/supabaseClients'; // No longer needed for direct Supabase calls here
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // const supabase = createClient(); // Supabase client initialized in API route

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    console.log('Attempting sign up via API with:', { email, password });

    try {
      const response = await fetch('/api/auth/register', {
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
        setMessage(`Sign up failed: ${errorDetails || response.statusText}`);
        console.error('Sign up error from API:', data);
      } else {
        setMessage(data.message || 'Sign up successful! Please check your email to confirm your account.');
        console.log('Sign up successful via API:', data);
        // The profile creation logic is now part of the /api/auth/register if needed,
        // or could be a subsequent step triggered by email confirmation.
        // For now, we assume the API handles what's necessary post-signup.

        // Optionally, redirect or clear form here after a delay
        // router.push('/auth/login'); // Or a page indicating to check email
      }
    } catch (error) {
      console.error('Network or other error during sign up:', error);
      setMessage('Sign up failed due to a network or unexpected error. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <button 
          type="submit"
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sign Up
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: message.includes('failed') ? 'red' : 'green' }}>{message}</p>}
      <p style={{ marginTop: '10px', textAlign: 'center' }}>
        Already have an account? <a href="/auth/login">Login</a>
      </p>
      <p style={{fontSize: '0.8em', color: 'gray', marginTop: '20px'}}>User Registration Page ([`app/auth/signup/page.tsx`](app/auth/signup/page.tsx))</p>
    </div>
  );
}