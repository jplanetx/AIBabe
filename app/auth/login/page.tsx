// app/auth/login/page.tsx
'use client';

import React, { useState } from 'react';
// import { createClient } from '@/lib/supabaseClients'; // No longer needed for direct Supabase calls here
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // const supabase = createClient(); // Supabase client initialized in API route

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
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
        // router.push('/chat'); // Redirect to chat page on successful login
        // Instead of push, we might want to refresh the page or let Supabase redirect based on session
        router.refresh(); // This will re-fetch server components and update based on new cookie
        router.push('/dashboard'); // Or any other protected page
      }
    } catch (error) {
      console.error('Network or other error during login:', error);
      setMessage('Login failed due to a network or unexpected error. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
          Login
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: message.includes('failed') ? 'red' : 'green' }}>{message}</p>}
      <p style={{ marginTop: '10px', textAlign: 'center' }}>
        Don't have an account? <a href="/auth/signup">Sign Up</a>
      </p>
      <p style={{fontSize: '0.8em', color: 'gray', marginTop: '20px'}}>User Login Page ([`app/auth/login/page.tsx`](app/auth/login/page.tsx))</p>
    </div>
  );
}