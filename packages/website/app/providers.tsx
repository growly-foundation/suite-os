'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Growly Foundation - Growly Customer Support
export const DUMMY_AGENT_ID = '22520453-f7b3-4c94-9cd4-5946c90c3c92';
export const DUMMY_ORGANIZATION_API_KEY = 'b3803e17-2435-4d5b-8cbe-3638c7ee539c';

const SuiteProvider = dynamic(() => import('@growly/suite').then(suite => suite.SuiteProvider), {
  ssr: false,
});

const ChatWidget = dynamic(() => import('@growly/suite').then(suite => suite.ChatWidget), {
  ssr: false,
});

export const SuiteProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SuiteProvider
      context={{
        agentId: DUMMY_AGENT_ID,
        organizationApiKey: DUMMY_ORGANIZATION_API_KEY,
        config: {
          display: 'fullView',
        },
        session: {
          walletConnect: {
            projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '',
          },
        },
      }}>
      <Suspense fallback={null}>
        {children}
        <ChatWidget />
      </Suspense>
    </SuiteProvider>
  );
};
