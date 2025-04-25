import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { WagmiProvider } from 'wagmi';
import { MultichainMagicProvider, NativeMagicProvider } from '@/core';
import { getDefaultConfig, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { base } from 'viem/chains';
import { CustomRainbowAvatar } from './components';

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'Growly',
  projectId: import.meta.env.VITE_RAINBOW_PROJECT_ID,
  chains: [base],
  appIcon: '/logo.png',
  appDescription:
    'Streamline on-chain and off-chain data to your Web3.0 applications with a few lines of code.',
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
          initialChain={base}>
          <MultichainMagicProvider>
            <NativeMagicProvider>{children}</NativeMagicProvider>
          </MultichainMagicProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export default Providers;
