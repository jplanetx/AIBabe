'use client';

import React from 'react';
import OnboardingForm from '@/components/onboarding/onboarding-form';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Join AI Girlfriend</h1>
          <p className="text-gray-300">Create your account to get started</p>
        </div>
        
        <OnboardingForm />
      </div>
    </div>
  );
}
