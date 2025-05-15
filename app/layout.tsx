import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "../components/layout/header";
import Footer from "../components/layout/Footer";

import { Component, ReactNode, ErrorInfo } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Girlfriend - Your Perfect Digital Companion",
  description: "Experience meaningful connections with AI companions designed to provide emotional support, engaging conversations, and personalized interactions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
                   <ErrorBoundary>
                     <div className="flex flex-col min-h-screen">
                       <Header />
                       <main className="flex-grow">{children}</main>
                       <Footer />
                     </div>
                   </ErrorBoundary>
                 </ThemeProvider>
      </body>
    </html>
  );
}