'use client';

import { Suspense } from 'react';
import { ThemeProvider } from '../theme-provider';
import { SuiteProvider, Theme } from '@growly/suite';
import { PrivyProvider } from '@privy-io/react-auth';
import ProtectedAuthProvider from '@/components/providers/protected-auth-provider';
import { ToastContainer } from 'react-toastify';
import '@growly/suite/styles.css';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@growly/suite').then(suite => suite.ChatWidget), {
  ssr: false,
});

const AnimatedLoading = dynamic(
  () =>
    import('@/components/animated-components/animated-loading').then(
      module => module.AnimatedLoading
    ),
  { ssr: false }
);

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
      config={{
        loginMethods: ['email'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}>
      <SuiteProvider
        config={{
          agent: {
            name: 'Growly Customer Support',
          },
          theme: Theme.monoTheme,
        }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <ProtectedAuthProvider>
            <Suspense fallback={<AnimatedLoading />}>
              {children}
              <ChatWidget />
              <ToastContainer />
            </Suspense>
          </ProtectedAuthProvider>
        </ThemeProvider>
      </SuiteProvider>
    </PrivyProvider>
  );
};
