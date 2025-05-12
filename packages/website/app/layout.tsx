import type React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { coinbaseFont } from './fonts';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Growly Suite | Secure AI Solutions for Business & Government',
  description:
    'Enterprise-grade AI platform with LLM conversations, customizable agents, secure knowledge base, and MCP server support for businesses and government agencies.',
  keywords:
    'enterprise AI, secure AI, government AI solutions, LLM, knowledge base, AI agents, MCP server',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://getgrowly.app',
    title: 'Growly Suite | Secure AI Solutions',
    description:
      'Enterprise-grade AI platform with advanced security, customization, and control for businesses and government agencies.',
    siteName: 'Growly Suite',
    images: [
      {
        url: 'https://getgrowly.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Growly Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Growly Suite | Secure AI Solutions',
    description: 'Enterprise-grade AI platform with advanced security, customization, and control.',
    images: ['https://getgrowly.app/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: 'v0.dev',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background antialiased',
          coinbaseFont.variable,
          geistSans.variable,
          geistMono.variable
        )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
