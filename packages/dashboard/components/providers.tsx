'use client';

import { Suspense, useEffect } from 'react';
import { useWorkflowManagerStore } from '@/hooks/use-workflow-manager';
import { ThemeProvider } from './theme-provider';
import { SuiteProvider, DemoChatWidget, Theme } from '@growly/suite';
import '@growly/suite/styles.css';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const { fetchWorkflows } = useWorkflowManagerStore();

  useEffect(() => {
    fetchWorkflows();
    const unsubscribe = useWorkflowManagerStore.subscribe(state => state.workflows);
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SuiteProvider
        config={{
          agent: {
            name: 'Growly Customer Support',
          },
          theme: Theme.monoTheme,
        }}>
        <Suspense>
          {children}
          <DemoChatWidget />
        </Suspense>
      </SuiteProvider>
    </ThemeProvider>
  );
};
