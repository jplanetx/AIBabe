'use client';

import React, { useState } from 'react';
import './onboarding-form.css'; // Add this line to include styles for the spinner
import { supabase } from '../../lib/supabaseClients';

export default function OnboardingForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const simulateFormSubmission = async (name: string, email: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'TempPass123!',
      });

      if (error) {
        throw error;
      }

      console.log('Signup success:', data);
      alert('Signup complete! Now try logging in.');
    } catch (err: any) {
      console.error('Signup error:', err.message);
      alert('Signup failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateFormSubmission(name, email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <br />
      <button type="submit" disabled={isLoading}>
        {isLoading ? (
          <span>
            <span className="spinner" /> Creating account...
          </span>
        ) : (
          'Get Started'
        )}
      </button>
    </form>
  );
}
