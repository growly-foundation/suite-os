'use client';

import { Suspense } from 'react';
import { ThemeProvider } from '../theme-provider';
import { SuiteProvider, Theme } from '@growly/suite';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { ToastContainer } from 'react-toastify';
import '@growly/suite/styles.css';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from 'reactflow';

const ChatWidget = dynamic(() => import('@growly/suite').then(suite => suite.DemoChatWidget), {
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
  const { user } = usePrivy();
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
        context={{
          agentId: '',
          organizationApiKey: '',
          session: {
            walletAddress: user?.wallet?.address as any,
          },
          config: {
            theme: Theme.monoTheme,
            display: 'fullView',
          },
        }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <ReactFlowProvider>
            <Suspense fallback={<AnimatedLoading />}>
              {children}
              <ChatWidget />
              <ToastContainer />
            </Suspense>
          </ReactFlowProvider>
        </ThemeProvider>
      </SuiteProvider>
    </PrivyProvider>
  );
};
