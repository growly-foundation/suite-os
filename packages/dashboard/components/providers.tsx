'use client';

import { Suspense, useEffect } from 'react';
import { useWorkflowManagerStore } from '@/hooks/use-workflow-manager';
import { ThemeProvider } from './theme-provider';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const { fetchWorkflows } = useWorkflowManagerStore();

  useEffect(() => {
    fetchWorkflows();
    const unsubscribe = useWorkflowManagerStore.subscribe(state => state.workflows);
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Suspense>{children}</Suspense>
    </ThemeProvider>
  );
};
