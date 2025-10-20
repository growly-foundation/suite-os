import {
  ChainFeatureKey,
  ChainFeatureRegistry,
  ChainFeatureWithMetadata,
  ChainFeatures,
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
} as const;

/**
 * Chain features registry that defines what functionality is supported for each chain
 * This helps determine UI availability and feature restrictions based on the selected chain
 */
export const CHAIN_FEATURES: Record<number, ChainFeatures> = {
  // Ethereum Mainnet - full support
  [mainnet.id]: {
    [ChainFeatureKey.SUPPORTS_NFTS]: true,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
  },

  // Optimism - full support
  [optimism.id]: {
    [ChainFeatureKey.SUPPORTS_NFTS]: true,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
  },

  // Base - full support
  [base.id]: {
    [ChainFeatureKey.SUPPORTS_NFTS]: true,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
  },

  // Celo - full support
  [celo.id]: {
    [ChainFeatureKey.SUPPORTS_NFTS]: true,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
  },

  // HyperEVM - limited support (no NFTs)
  999: {
    [ChainFeatureKey.SUPPORTS_NFTS]: false,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
  },

  // Berachain - limited support (no NFTs)
  [berachain.id]: {
    [ChainFeatureKey.SUPPORTS_NFTS]: false,
    [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: true,
    [ChainFeatureKey.SUPPORTS_RESOURCES]: true,
  },
};

/**
 * Get features for a specific chain ID
 */
export function getChainFeatures(chainId: number): ChainFeatures | null {
  return CHAIN_FEATURES[chainId] || null;
}

/**
 * Check if a specific feature is supported for a chain
 */
export function isChainFeatureSupported(chainId: number, feature: ChainFeatureKey): boolean {
  const features = getChainFeatures(chainId);
  return features ? features[feature] : false;
}

/**
 * Get all chain IDs that support a specific feature
 */
export function getChainsWithFeature(feature: ChainFeatureKey): number[] {
  return Object.entries(CHAIN_FEATURES)
    .filter(([, features]) => features[feature])
    .map(([chainId]) => parseInt(chainId));
}

/**
 * Get all chain IDs that do NOT support a specific feature
 */
export function getChainsWithoutFeature(feature: ChainFeatureKey): number[] {
  return Object.entries(CHAIN_FEATURES)
    .filter(([, features]) => !features[feature])
    .map(([chainId]) => parseInt(chainId));
}

/**
 * Get all enabled features for a specific chain with their metadata
 */
export function getChainFeaturesWithMetadata(chainId: number): ChainFeatureWithMetadata[] {
  const features = getChainFeatures(chainId);
  if (!features) return [];

  return Object.values(ChainFeatureKey)
    .map(featureKey => {
      const featureConfig = CHAIN_FEATURE_REGISTRY[featureKey];
      const enabled = features[featureKey];

      return {
        ...featureConfig,
        enabled,
        config: featureConfig.config, // Include the config field for future extensibility
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
