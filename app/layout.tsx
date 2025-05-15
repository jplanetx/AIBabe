import "./globals.css";
import { ReactNode } from "react";
import ClientLayout from "../components/layout/ClientLayout";

export const metadata = {
  title: "AI Girlfriend",
  description: "Your Perfect Digital Companion",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
