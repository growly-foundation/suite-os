import {
  ChainConfiguration,
  ChainFeatureKey,
  ChainFeatureRegistry,
  ChainFeatureWithMetadata,
  ChainFeatures,
  PreferredFungibleApiProvider,
} from '@/types/chains';
import { base, berachain, celo, mainnet, optimism } from 'viem/chains';

/**
 * Registry of all chain features with their metadata
 */
export const CHAIN_FEATURE_REGISTRY: ChainFeatureRegistry = {
  [ChainFeatureKey.SUPPORTS_NFTS]: {
    key: ChainFeatureKey.SUPPORTS_NFTS,
    title: 'NFT Holder Import',
    description: 'Import and analyze NFT holders from ERC721 and ERC1155 contracts',
    badgeStyle: {
      backgroundColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
  },
  [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: {
    key: ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS,
    title: 'Contract Interaction Import',
    description: 'Import and analyze smart contract interactions and transactions',
    badgeStyle: {
      backgroundColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
  },
  [ChainFeatureKey.SUPPORTS_RESOURCES]: {
    key: ChainFeatureKey.SUPPORTS_RESOURCES,
    title: 'Contract ABI Resources',
    description: 'Access to contract ABI resources and metadata',
    badgeStyle: {
      backgroundColor: 'bg-purple-100',
      textColor: 'text-purple-800',
    },
  },
  [ChainFeatureKey.SUPPORTS_NFT_POSITIONS]: {
    key: ChainFeatureKey.SUPPORTS_NFT_POSITIONS,
    title: 'NFT Position Data',
    description: 'Access to NFT position and portfolio data via Zerion API',
    badgeStyle: {
      backgroundColor: 'bg-orange-100',
      textColor: 'text-orange-800',
    },
  },
} as const;

/**
 * Chain configuration registry that defines what functionality is supported for each chain
 * This helps determine UI availability and feature restrictions based on the selected chain
 */
export const CHAIN_FEATURES: Record<number, ChainConfiguration> = {
  // Ethereum Mainnet - full support, prefer Alchemy for fungible tokens
  [mainnet.id]: {
    [ChainFeatureKey.SUPPORTS_NFTS]: true,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
    [ChainFeatureKey.SUPPORTS_NFT_POSITIONS]: true,
    preferredFungibleApi: PreferredFungibleApiProvider.ALCHEMY,
  },

  // Optimism - full support, prefer Alchemy for fungible tokens
  [optimism.id]: {
    [ChainFeatureKey.SUPPORTS_NFTS]: true,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
    [ChainFeatureKey.SUPPORTS_NFT_POSITIONS]: true,
    preferredFungibleApi: PreferredFungibleApiProvider.ALCHEMY,
  },

  // Base - full support, prefer Alchemy for fungible tokens
  [base.id]: {
    [ChainFeatureKey.SUPPORTS_NFTS]: true,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
    [ChainFeatureKey.SUPPORTS_NFT_POSITIONS]: true,
    preferredFungibleApi: PreferredFungibleApiProvider.ALCHEMY,
  },

  // Celo - full support, use Zerion for fungible tokens
  [celo.id]: {
    [ChainFeatureKey.SUPPORTS_NFTS]: true,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
    [ChainFeatureKey.SUPPORTS_NFT_POSITIONS]: true,
    preferredFungibleApi: PreferredFungibleApiProvider.ZERION,
  },

  // HyperEVM - limited support (no NFTs), use Zerion for fungible tokens
  999: {
    [ChainFeatureKey.SUPPORTS_NFTS]: false,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
    [ChainFeatureKey.SUPPORTS_NFT_POSITIONS]: false,
    preferredFungibleApi: PreferredFungibleApiProvider.ZERION,
  },

  // Berachain - limited support (no NFTs), prefer Alchemy for fungible tokens
  [berachain.id]: {
    [ChainFeatureKey.SUPPORTS_NFTS]: false,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
    [ChainFeatureKey.SUPPORTS_NFT_POSITIONS]: false,
    preferredFungibleApi: PreferredFungibleApiProvider.ALCHEMY,
  },
};

/**
 * Get configuration for a specific chain ID (internal use only)
 */
export function getChainFeatures(chainId: number): ChainConfiguration | null {
  return CHAIN_FEATURES[chainId] || null;
}

/**
 * Get client-facing features for a specific chain ID
 */
export function getChainClientFeatures(chainId: number): ChainFeatures | null {
  const config = getChainFeatures(chainId);
  if (!config) return null;

  // Extract only the client-facing features
  const { preferredFungibleApi, ...clientFeatures } = config;
  return clientFeatures;
}

/**
 * Check if a specific feature is supported for a chain
 */
export function isChainFeatureSupported(chainId: number, feature: ChainFeatureKey): boolean {
  const features = getChainClientFeatures(chainId);
  return features ? features[feature] : false;
}

/**
 * Get all chain IDs that support a specific feature
 */
export function getChainsWithFeature(feature: ChainFeatureKey): number[] {
  return Object.entries(CHAIN_FEATURES)
    .filter(([, config]) => config[feature])
    .map(([chainId]) => parseInt(chainId));
}

/**
 * Get all chain IDs that do NOT support a specific feature
 */
export function getChainsWithoutFeature(feature: ChainFeatureKey): number[] {
  return Object.entries(CHAIN_FEATURES)
    .filter(([, config]) => !config[feature])
    .map(([chainId]) => parseInt(chainId));
}

/**
 * Get all enabled features for a specific chain with their metadata
 */
export function getChainFeaturesWithMetadata(chainId: number): ChainFeatureWithMetadata[] {
  const clientFeatures = getChainClientFeatures(chainId);
  if (!clientFeatures) return [];

  return Object.values(ChainFeatureKey)
    .map(featureKey => {
      const featureConfig = CHAIN_FEATURE_REGISTRY[featureKey];
      const enabled = clientFeatures[featureKey];

      return {
        ...featureConfig,
        enabled,
      };
    })
    .filter(feature => feature.enabled);
}

/**
 * Get feature configuration by key
 */
export function getFeatureConfig(featureKey: ChainFeatureKey) {
  return CHAIN_FEATURE_REGISTRY[featureKey];
}

/**
 * Get all available feature keys
 */
export function getAllFeatureKeys(): ChainFeatureKey[] {
  return Object.values(ChainFeatureKey);
}

/**
 * Get the preferred fungible token API provider for a specific chain (internal use only)
 */
export function getPreferredFungibleApiProvider(chainId: number): PreferredFungibleApiProvider {
  const config = getChainFeatures(chainId);
  if (!config) return PreferredFungibleApiProvider.ZERION;
  return config.preferredFungibleApi;
}

/**
 * Get chain IDs that prefer a specific fungible API provider (internal use only)
 */
export function getChainsByFungibleApiProvider(provider: PreferredFungibleApiProvider): number[] {
  return Object.entries(CHAIN_FEATURES)
    .filter(([, config]) => config.preferredFungibleApi === provider)
    .map(([chainId]) => parseInt(chainId));
}
