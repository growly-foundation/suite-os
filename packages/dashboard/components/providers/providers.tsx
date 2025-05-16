'use client';

import { Suspense } from 'react';
import { ThemeProvider } from '../theme-provider';
import { PrivyProvider } from '@privy-io/react-auth';
import { ToastContainer } from 'react-toastify';
import '@growly/suite/styles.css';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from 'reactflow';
import { SuiteProviderWrapper } from './suite-provider';

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
      <SuiteProviderWrapper>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
      </SuiteProviderWrapper>
    </PrivyProvider>
  );
};
