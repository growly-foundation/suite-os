'use client';

import { Suspense } from 'react';
import { ThemeProvider } from '../theme-provider';
import { SuiteProvider, DemoChatWidget, Theme } from '@growly/suite';
import '@growly/suite/styles.css';
import { PrivyProvider } from '@privy-io/react-auth';
import ProtectedAuthProvider from '@/components/providers/protected-auth-provider';
import { ToastContainer } from 'react-toastify';

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
            <Suspense>
              {children}
              <DemoChatWidget />
              <ToastContainer />
            </Suspense>
          </ProtectedAuthProvider>
        </ThemeProvider>
      </SuiteProvider>
    </PrivyProvider>
  );
};
