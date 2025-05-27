'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './onboarding-form.css'; // Add this line to include styles for the spinner
import { supabase } from '../../lib/supabaseClients';

export default function OnboardingForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const simulateFormSubmission = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Validate password confirmation
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        throw error;
      }

      console.log('Signup success:', data);
      
      // Show success message and redirect to login
      alert('Signup complete! Please check your email to confirm your account, then you can log in with your email and password.');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (err: any) {
      console.error('Signup error:', err.message);
      alert('Signup failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateFormSubmission(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </label>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password (min. 6 characters)"
          required
          minLength={6}
        />
      </label>
      <label>
        Confirm Password:
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
          minLength={6}
        />
      </label>
      <button type="submit" disabled={isLoading}>
        {isLoading ? (
          <span>
            <span className="spinner" /> Creating account...
          </span>
        ) : (
          'Get Started'
        )}
      </button>
      
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link 
            href="/auth/login" 
            style={{ 
              color: '#ec4899', 
              textDecoration: 'none',
              fontWeight: '500'
            }}
            className="hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  );
}
