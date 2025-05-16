import type React from 'react';
import './globals.css';
import { coinbaseFont } from './fonts';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Growly Suite',
  description: 'Growly Suite | Empower DeFi Adoption with AI-powered Engine',
  authors: [{ name: 'Growly Foundation' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background antialiased',
          coinbaseFont.variable,
          geistSans.variable,
          geistMono.variable
        )}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
