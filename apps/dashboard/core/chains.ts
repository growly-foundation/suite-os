import { Chain, defineChain } from 'viem';
import { base, berachain, celo, mainnet, optimism } from 'viem/chains';

import { TChainName } from '@getgrowly/chainsmith/types';

const hyperevm = defineChain({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'Hyperliquid',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: { name: 'HyperEVMScan', url: 'https://hyperevmscan.io/' },
  },
});

export const SUPPORTED_CHAINS: Chain[] = [mainnet, optimism, hyperevm, base, berachain, celo];
export const SUPPORTED_CHAIN_NAMES: TChainName[] = [
  'mainnet',
  'optimism',
  'hyperevm',
  'base',
  'berachain',
  'celo',
];
