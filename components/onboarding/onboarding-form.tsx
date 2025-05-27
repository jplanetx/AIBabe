'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import './onboarding-form.css';

interface PreferenceOption {
  id: string;
  label: string;
  description: string;
}

const PERSONALITY_PREFERENCES: PreferenceOption[] = [
  { id: 'supportive', label: 'Supportive & Caring', description: 'Nurturing, empathetic, always there for you' },
  { id: 'playful', label: 'Playful & Fun', description: 'Spontaneous, flirty, loves adventures' },
  { id: 'intellectual', label: 'Intellectual & Deep', description: 'Thoughtful conversations, shared learning' },
  { id: 'admiring', label: 'Admiring & Appreciative', description: 'Celebrates your achievements, builds confidence' },
  { id: 'motivating', label: 'Motivating & Growth-Focused', description: 'Helps you reach your goals and potential' }
];

const INTERACTION_PREFERENCES: PreferenceOption[] = [
  { id: 'casual', label: 'Casual & Relaxed', description: 'Easy-going conversations, no pressure' },
  { id: 'romantic', label: 'Romantic & Intimate', description: 'Deep emotional connection, romantic gestures' },
  { id: 'friendly', label: 'Friendly & Supportive', description: 'Like talking to your best friend' },
  { id: 'professional', label: 'Respectful & Polite', description: 'Courteous and well-mannered interactions' }
];

export default function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    displayName: '',
    personalityType: '',
    interactionStyle: '',
    interests: [] as string[],
    relationshipGoals: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePreferenceSelect = (category: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Save user preferences to UserProfile
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: preferences.displayName,
          personalityType: preferences.personalityType,
          interactionStyle: preferences.interactionStyle,
          interests: preferences.interests,
          relationshipGoals: preferences.relationshipGoals
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      // Redirect to girlfriend selection
      router.push('/girlfriends');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-foreground/60">Step {step} of 4</span>
          <span className="text-sm text-foreground/60">{Math.round((step / 4) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-secondary/20 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What should we call you?</h2>
              <p className="text-foreground/70">This is how your AI companion will address you.</p>
            </div>
            <input
              type="text"
              value={preferences.displayName}
              onChange={(e) => setPreferences(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Enter your preferred name"
              className="w-full p-4 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              onClick={nextStep}
              disabled={!preferences.displayName.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What personality attracts you?</h2>
              <p className="text-foreground/70">Choose the personality type you'd most enjoy interacting with.</p>
            </div>
            <div className="space-y-3">
              {PERSONALITY_PREFERENCES.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handlePreferenceSelect('personalityType', option.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    preferences.personalityType === option.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <h3 className="font-semibold">{option.label}</h3>
                  <p className="text-sm text-foreground/70 mt-1">{option.description}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={prevStep} className="flex-1 btn-outline">
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!preferences.personalityType}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">How do you prefer to interact?</h2>
              <p className="text-foreground/70">This helps us set the right tone for your conversations.</p>
            </div>
            <div className="space-y-3">
              {INTERACTION_PREFERENCES.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handlePreferenceSelect('interactionStyle', option.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    preferences.interactionStyle === option.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <h3 className="font-semibold">{option.label}</h3>
                  <p className="text-sm text-foreground/70 mt-1">{option.description}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={prevStep} className="flex-1 btn-outline">
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!preferences.interactionStyle}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What are you looking for?</h2>
              <p className="text-foreground/70">Help us understand your goals for this experience.</p>
            </div>
            <textarea
              value={preferences.relationshipGoals}
              onChange={(e) => setPreferences(prev => ({ ...prev, relationshipGoals: e.target.value }))}
              placeholder="What would you like from your AI companion? (e.g., emotional support, fun conversations, someone to talk about my interests with...)"
              rows={4}
              className="w-full p-4 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex gap-3">
              <button onClick={prevStep} className="flex-1 btn-outline">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !preferences.relationshipGoals.trim()}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>
                    <span className="spinner" /> Saving...
                  </span>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
