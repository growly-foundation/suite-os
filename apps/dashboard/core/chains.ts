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

/**
 * Network name mapping for external API compatibility
 * Maps internal chain names to API-specific network identifiers
 */
export const NETWORK_NAME_MAPPINGS = {
  // Internal name -> Alchemy network name
  alchemy: {
    ethereum: 'eth-mainnet',
    optimism: 'opt-mainnet',
    'op mainnet': 'opt-mainnet',
    base: 'base-mainnet',
    berachain: 'berachain-mainnet',
    celo: 'celo-mainnet',
    hyperevm: 'hyperliquid-mainnet',
  } as Record<string, string>,

  // Internal name -> Zerion chain id
  zerion: {
    ethereum: 'ethereum',
    optimism: 'optimism',
    'op mainnet': 'optimism',
    base: 'base',
    berachain: 'berachain',
    celo: 'celo',
    hyperevm: 'hyperevm',
  } as Record<string, string>,
} as const;

/**
 * Get the network name for a specific API provider
 */
export function getNetworkNameForApi(chainName: string, api: 'alchemy' | 'zerion'): string {
  if (!chainName) return '';
  const mapping = NETWORK_NAME_MAPPINGS[api];
  if (!mapping) return chainName.toLowerCase();
  return mapping[chainName.toLowerCase()] || chainName.toLowerCase();
}
