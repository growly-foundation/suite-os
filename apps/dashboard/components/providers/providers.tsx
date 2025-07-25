'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { ReactFlowProvider } from 'reactflow';

import '@getgrowly/suite/styles.css';

import { AddResourceDrawer } from '../resources/add-resource-drawer';
import { ThemeProvider } from '../theme-provider';
import { ComponentProvider } from './component-provider';
import { SuiteProviderWrapper } from './suite-provider';

const AnimatedLoading = dynamic(
  () =>
    import('@/components/animated-components/animated-loading').then(
      module => module.AnimatedLoading
    ),
  { ssr: false }
);

export const Providers = ({ children }: { children: React.ReactNode }) => {
  // Create a new QueryClient instance for React Query
  const [queryClient] = useState(() => new QueryClient());
  let baseComponent = (
    <QueryClientProvider client={queryClient}>
      <SuiteProviderWrapper>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <ReactFlowProvider>
            <ComponentProvider>
              <Suspense fallback={<AnimatedLoading />}>
                {children}
                <ToastContainer />
                <AddResourceDrawer />
              </Suspense>
            </ComponentProvider>
          </ReactFlowProvider>
        </ThemeProvider>
      </SuiteProviderWrapper>
    </QueryClientProvider>
  );
  // If environment variables for Privy credentials are not set,
  // do not wrap the component with PrivyProvider.
  if (process.env.NEXT_PUBLIC_PRIVY_APP_ID && process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID) {
    baseComponent = (
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
        clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
        config={{
          loginMethods: ['email'],
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}>
        {baseComponent}
      </PrivyProvider>
    );
  }
  return baseComponent;
};
