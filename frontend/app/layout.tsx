import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';

export const metadata: Metadata = {
  title: 'CodeSentinel — Context-Aware Security Intelligence Platform',
  description: 'Context-aware security intelligence platform for modern DevSecOps. Detect, prioritize, and fix vulnerabilities before production.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-text-primary min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
