/**
 * Enum defining all available chain features
 */
export enum ChainFeatureKey {
  SUPPORTS_NFTS = 'supportsNFTs',
  SUPPORTS_CONTRACT_IMPORTS = 'supportsContractImports',
  SUPPORTS_RESOURCES = 'supportsResources',
  SUPPORTS_NFT_POSITIONS = 'supportsNftPositions',
}

/**
 * Configuration for a chain feature
 */
export interface ChainFeatureConfig {
  /** Unique identifier for the feature */
  key: ChainFeatureKey;
  /** Display title for the feature */
  title: string;
  /** Detailed description of what the feature provides */
  description: string;
  /** Badge styling configuration */
  badgeStyle: {
    backgroundColor: string;
    textColor: string;
  };
  /** Whether this feature is enabled for the chain */
  enabled: boolean;
  /** Future configuration options (extensible) */
  config?: Record<string, any>;
}

/**
 * Type for the chain feature registry (defined in core/chain-features.ts)
 */
export type ChainFeatureRegistry = Record<ChainFeatureKey, Omit<ChainFeatureConfig, 'enabled'>>;

/**
 * Chain features object using the registry keys
 */
export interface ChainFeatures {
  [ChainFeatureKey.SUPPORTS_NFTS]: boolean;
  [ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS]: boolean;
  [ChainFeatureKey.SUPPORTS_RESOURCES]: boolean;
  [ChainFeatureKey.SUPPORTS_NFT_POSITIONS]: boolean;
}

/**
 * Enhanced chain feature with metadata
 */
export interface ChainFeatureWithMetadata extends ChainFeatureConfig {
  enabled: boolean;
}

export type ChainFeature = ChainFeatureKey;
