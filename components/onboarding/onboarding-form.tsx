'use client';

import React, { useState } from 'react';
import { createClient } from '../libs/supabaseClients';

const OnboardingForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const simulateFormSubmission = async (name: string, email: string) => {
    const password = 'TempPass123!'; // temporary password for testing

const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

    if (error) {
      console.error('Signup error:', error.message);
      alert('Signup failed: ' + error.message);
      return;
    }

    console.log('Signup success:', data);
    alert('Signup complete! Now try logging in.');
    // Optionally: move to next screen or store name
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
      <button type="submit">Get Started</button>
    </form>
  );
};

export default OnboardingForm;
