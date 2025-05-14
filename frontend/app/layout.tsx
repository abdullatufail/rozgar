import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";
import { Toaster } from "../components/ui/toaster";
import { Navbar } from "../components/common/Navbar";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rozgaar",
  description: "Find and hire freelancers for your projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            
            <main className="">{children}</main>
            <Toaster />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
