import "./globals.css";
import { ReactNode } from 'react';
import Navbar from "@/components/navbar"; // Import the Navbar component
import { ThemeProvider } from "@/components/theme-provider"; // Assuming you have a ThemeProvider

export const metadata = {
  title: 'AI Girlfriend',
  description: 'Your Perfect Digital Companion',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-black text-black dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="pt-20"> {/* Add top padding for the fixed navbar */}
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
