import "./globals.css";
import { ReactNode } from 'react'

export const metadata = {
  title: 'AI Girlfriend',
  description: 'Your Perfect Digital Companion',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* By applying Tailwind’s “bg-black” and “text-white” classes, you’ll have a black background and white text on all pages. */}
        {children}
      </body>
    </html>
  )
}
