'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClients';
import { Button } from '@/components/ui/button'; // Assuming ShadCN UI Button

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        // Optional: Display toast notification for error
        // e.g., toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
      } else {
        router.push('/auth/login');
      }
    } catch (err) {
      console.error('Error signing out:', err);
      // Optional: Display toast notification for unexpected error
      // e.g., toast({ title: "Logout Failed", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Logout
    </Button>
  );
};

export default LogoutButton;
