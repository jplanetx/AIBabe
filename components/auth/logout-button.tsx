// components/auth/logout-button.tsx
'use client';

import React from 'react';
import { createClient } from '@/lib/supabaseClients';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    console.log('Attempting logout...');
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      // Optionally, display a message to the user, though often signOut errors are less critical to display
      alert(`Logout failed: ${error.message}`); // Simple alert, consider a more integrated UI notification
    } else {
      console.log('Logout successful');
      router.push('/auth/login'); // Redirect to login page
      // router.refresh(); // Alternatively, to ensure server-side state is updated if needed
    }
  };

  return (
    <>
      <button
        onClick={handleLogout}
        style={{
          padding: '8px 15px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
      {/* The descriptive paragraph below might be removed in a real application or moved to a storybook */}
      <p style={{fontSize: '0.8em', color: 'gray', marginTop: '10px'}}>User Logout Button ([`components/auth/logout-button.tsx`](components/auth/logout-button.tsx))</p>
    </>
  );
}