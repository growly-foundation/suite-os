'use client';
import { ReactQueryClientProvider } from '@/components/react-query-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { AppStackProvider, DemoChatWidget, Theme } from '@growly/appstack';
import '@growly/appstack/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ReactQueryClientProvider>
        <AppStackProvider
          config={{
            agent: {
              name: 'Growly Internal',
            },
            theme: Theme.defaultDarkTheme,
          }}>
          {children}
          <DemoChatWidget />
        </AppStackProvider>
      </ReactQueryClientProvider>
    </ThemeProvider>
  );
}
