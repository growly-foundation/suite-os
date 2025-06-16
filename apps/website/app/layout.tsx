// Using default import
import { constructMetadata } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import Script from 'next/script';
import type React from 'react';

import '@getgrowly/suite/styles.css';
import '@getgrowly/ui/styles.css';

import { coinbaseFont } from './fonts';
// Load UI styles
import './globals.css';
import { AppInner } from './inner';

export const metadata = constructMetadata({
  // Base metadata is defined in the constructMetadata function
  // We can override specific values here if needed
});

// Define icon configurations separately for better organization
export const icons = {
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
};

// Add icons to metadata
metadata.icons = icons;

// Additional metadata settings
metadata.robots = {
  index: true,
  follow: true,
};
metadata.generator = 'v0.dev';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics Measurement ID */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EK55XN1XT5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EK55XN1XT5');
          `}
        </Script>
      </head>
      <body
        className={cn(
          'min-h-screen bg-background antialiased',
          coinbaseFont.variable,
          GeistSans.variable,
          GeistMono.variable
        )}
        style={{
          scrollBehavior: 'smooth',
        }}>
        <AppInner>{children}</AppInner>
      </body>
    </html>
  );
}
