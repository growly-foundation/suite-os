'use client';

import { Suspense, useEffect } from 'react';
import { ThemeProvider } from './theme-provider';
import { SuiteProvider, DemoChatWidget, Theme } from '@growly/suite';
import '@growly/suite/styles.css';
import { WorkflowManagementContextProvider } from '@/contexts/WorkflowManagementContext';
import { useAppStore } from '@/hooks/use-app-store';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const { fetchWorkflows } = useAppStore();

  useEffect(() => {
    fetchWorkflows();
    const unsubscribe = useAppStore.subscribe(state => state.workflows);
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
          <WorkflowManagementContextProvider>{children}</WorkflowManagementContextProvider>
          <DemoChatWidget />
        </Suspense>
      </SuiteProvider>
    </ThemeProvider>
  );
};
