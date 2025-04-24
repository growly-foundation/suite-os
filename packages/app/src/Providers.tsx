import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { WagmiProvider } from 'wagmi';
import { MultichainMagicProvider, NativeMagicProvider } from '@/core';
import { getDefaultConfig, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { sonic } from 'viem/chains';
import { CustomRainbowAvatar } from './components';

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'Cream',
  projectId: import.meta.env.VITE_RAINBOW_PROJECT_ID,
  chains: [sonic],
  appIcon: '/logo.png',
  appDescription: 'Manage your sonic onchain portfolio smarter with AI!',
  ssr: true,
});

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          avatar={CustomRainbowAvatar}
          theme={lightTheme({
            accentColor: '#FF8B00',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
          })}
          showRecentTransactions
          initialChain={sonic}>
          <MultichainMagicProvider>
            <NativeMagicProvider>{children}</NativeMagicProvider>
          </MultichainMagicProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export default Providers;
