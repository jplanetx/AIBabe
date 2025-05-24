// app/auth/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabaseClients';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const supabase = createClient();

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    console.log('Attempting sign up with:', { email, password });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`, // Or your desired callback URL
      },
    });

    if (error) {
      setMessage(`Sign up failed: ${error.message}`);
      console.error('Sign up error:', error);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // This case might indicate a user exists but is unconfirmed or some other edge case.
      // Supabase might return a user object even if identities are empty if "Confirm email" is ON and user already exists.
      setMessage('Sign up failed: User might already exist or an issue occurred.');
      console.warn('Sign up warning: User object returned but identities array is empty.', data.user);
    } else if (data.user) {
      setMessage('Sign up successful! Please check your email to confirm your account. Creating profile...');
      console.log('Sign up successful, user needs to confirm email:', data.user);

      // Create profile
      try {
        const profileResponse = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: data.user.id, email: data.user.email }),
        });

        if (!profileResponse.ok) {
          const profileError = await profileResponse.json();
          setMessage(`Sign up successful, but profile creation failed: ${profileError.error || profileResponse.statusText}. Please check your email to confirm your account.`);
          console.error('Profile creation error:', profileError);
        } else {
          const newProfile = await profileResponse.json();
          console.log('Profile created successfully:', newProfile);
          setMessage('Sign up and profile creation successful! Please check your email to confirm your account.');
        }
      } catch (profileApiError) {
        console.error('Error calling profile creation API:', profileApiError);
        setMessage('Sign up successful, but profile creation failed. Please check your email to confirm your account.');
      }

      // Optionally, redirect or clear form here after a delay
      // router.push('/auth/login'); // Or a page indicating to check email
    } else {
      // Fallback for unexpected response
      setMessage('Sign up attempt finished. Status unclear. Please try again or contact support.');
      console.warn('Sign up response unclear:', data);
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