// app/auth/login/page.tsx
'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabaseClients';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const supabase = createClient();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    console.log('Attempting login with:', { email, password });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Login failed: ${error.message}`);
      console.error('Login error:', error);
    } else if (data.user) {
      setMessage('Login successful!');
      console.log('Login successful, user:', data.user);
      router.push('/chat'); // Redirect to chat page on successful login
    } else {
      // Fallback for unexpected response
      setMessage('Login attempt finished. Status unclear. Please try again or contact support.');
      console.warn('Login response unclear:', data);
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