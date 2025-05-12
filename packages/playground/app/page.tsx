'use client';

import dynamic from 'next/dynamic';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWagmiConfig } from './wagmi';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

const AppProvider = dynamic(async () => (await import('@/components/AppProvider')).AppProvider, {
  ssr: false,
});

const Demo = dynamic(async () => await import('@/components/Demo'), {
  ssr: false,
});

export default function Home() {
  const wagmiConfig = useWagmiConfig();

  return (
    <AppProvider>
      <main className="flex min-h-screen w-full bg-muted/40">
        <Demo />
      </main>
    </AppProvider>
  );
}
