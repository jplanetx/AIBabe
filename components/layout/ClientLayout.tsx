'use client';

import { ReactNode } from 'react';
import Navbar from "@/components/navbar"; // Import the Navbar component

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pt-20">
      <Navbar />
      {children}
    </div>
  );
}
