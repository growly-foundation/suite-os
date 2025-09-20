import { ALCHEMY_CHAIN_ENDPOINT } from '@/config/rpc';
import { PublicClient, createPublicClient, http } from 'viem';
import { type Chain, base, baseSepolia, mainnet, sepolia } from 'viem/chains';

const BATCH_SIZE = 1024 * 12; // 12kb
const WAIT = 1000;

const BASE_RPC_URL = 'https://base.llamarpc.com';
const ETH_RPC_URL = 'https://eth.llamarpc.com';

function getChainPublicClient(chain: Chain) {
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (apiKey) {
    const endpoint = ALCHEMY_CHAIN_ENDPOINT[chain.id as keyof typeof ALCHEMY_CHAIN_ENDPOINT];
    const baseUrl = `${endpoint}/${apiKey}`;
    return createPublicClient({
      chain: chain,
      transport: http(baseUrl),
      batch: {
        multicall: {
          batchSize: BATCH_SIZE,
          wait: WAIT,
        },
      },
    });
  }
  // TODO: Add other chains here

  // Fallback to llama rpc
  if (chain === base) {
    return createPublicClient({
      chain: chain,
      transport: http(BASE_RPC_URL),
      batch: {
        multicall: {
          batchSize: BATCH_SIZE,
          wait: WAIT,
        },
      },
    });
  }

  return createPublicClient({
    chain: chain,
    transport: http(ETH_RPC_URL),
    batch: {
      multicall: {
        batchSize: BATCH_SIZE,
        wait: WAIT,
      },
    },
  });
}

// Initialize public clients for mainnet and base
export const publicClientByChain: Record<any, PublicClient> = {
  [mainnet.id]: getChainPublicClient(mainnet),
  [base.id]: getChainPublicClient(base),
};

/**
 * isEthereum
 *  - Checks if the chain is mainnet or sepolia
 */
export function isEthereum(chainId: number, isMainnetOnly = false): boolean {
  // If only ETH mainnet
  if (isMainnetOnly && chainId === mainnet.id) {
    return true;
  }
  // If only ETH or ETH Sepolia
  if (!isMainnetOnly && (chainId === sepolia.id || chainId === mainnet.id)) {
    return true;
  }
  return false;
}

/**
 * isBase
 *  - Checks if the paymaster operations chain id is valid
 *  - Only allows the Base and Base Sepolia chain ids
 */
export function isBase(chainId: number, isMainnetOnly = false): boolean {
  // If only Base mainnet
  if (isMainnetOnly && chainId === base.id) {
    return true;
  }
  // If only Base or Base Sepolia
  if (!isMainnetOnly && (chainId === baseSepolia.id || chainId === base.id)) {
    return true;
  }
  return false;
}
