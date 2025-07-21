import { Providers } from '@/components/providers/providers';
import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import type React from 'react';

import { coinbaseFont } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Suite Dashboard | Create Growth That Lasts.',
  description: 'Manage your AI agents for Growly Suite and workflows with ease.',
  keywords: 'Growly, DeFi, AI, LLM, MCP, knowledge base, AI agents, MCP server',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://app.getsuite.io',
    title: 'Suite Dashboard | Create Growth That Lasts.',
    description: 'Manage your AI agents for Growly Suite and workflows with ease.',
    siteName: 'Suite Dashboard | Create Growth That Lasts.',
    images: [
      {
        url: 'https://getsuite.io/banners/dashboard-banner.png',
        width: 1200,
        height: 630,
        alt: 'Suite Dashboard | Create Growth That Lasts.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Suite Dashboard | Create Growth That Lasts. | Manage your AI agents for Growly Suite and workflows with ease.',
    description: 'Manage your AI agents for Growly Suite and workflows with ease.',
    images: ['https://getsuite.io/banners/dashboard-banner.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: 'v0.dev',
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
          GeistSans.variable,
          GeistMono.variable
        )}>
        <div className="overflow-auto h-screen">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
