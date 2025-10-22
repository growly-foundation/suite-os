// Alchemy Portfolio API Types

// Common
export type AlchemyNetwork = string; // use documented enums like 'eth-mainnet', 'base-mainnet', etc.

export interface AlchemyAddressNetworksPair {
  address: string;
  networks: AlchemyNetwork[];
}

// Tokens By Address (with metadata and prices)
export interface AlchemyTokensByAddressRequest {
  addresses: AlchemyAddressNetworksPair[]; // max 2 addresses, max 5 networks per address
  withMetadata?: boolean; // default true
  withPrices?: boolean; // default true
  includeNativeTokens?: boolean; // default true
  includeErc20Tokens?: boolean; // default true
  pageKey?: string;
}

export interface AlchemyTokenMetadata {
  decimals: number | null;
  logo: string | null;
  name: string | null;
  symbol: string | null;
}

export interface AlchemyTokenPrice {
  currency: string; // e.g. 'usd'
  value: string; // stringified number
  lastUpdatedAt: string; // ISO datetime
}

export interface AlchemyTokenWithPrice {
  address: string; // wallet address
  network: string; // network id
  tokenAddress: string | null; // null for native
  tokenBalance: string; // raw string balance
  tokenMetadata: AlchemyTokenMetadata;
  tokenPrices: AlchemyTokenPrice[];
  error?: string | null;
}

export interface AlchemyTokensByAddressResponse {
  data: {
    tokens: AlchemyTokenWithPrice[];
    pageKey?: string;
  };
}

// Token Balances By Address (balances only)
export interface AlchemyTokenBalancesByAddressRequest {
  addresses: AlchemyAddressNetworksPair[]; // limit 3 pairs, max 20 networks
  includeNativeTokens?: boolean; // default true
  includeErc20Tokens?: boolean; // default true
  pageKey?: string;
}

export interface AlchemyTokenBalanceItem {
  network: string;
  address: string; // wallet address
  tokenAddress: string | null;
  tokenBalance: string; // raw string balance
}

export interface AlchemyTokenBalancesByAddressResponse {
  data: {
    tokens: AlchemyTokenBalanceItem[];
    pageKey?: string;
  };
}

// NFTs By Address
export interface AlchemyNftsByAddressRequest {
  addresses: AlchemyAddressNetworksPair[]; // limit 2, max 15 networks each
  withMetadata?: boolean; // default true
  pageKey?: string;
  pageSize?: number; // default 100
  orderBy?: 'transferTime';
  sortOrder?: 'asc' | 'desc';
}

export interface AlchemyNftImage {
  cachedUrl?: string | null;
  thumbnailUrl?: string | null;
  pngUrl?: string | null;
  contentType?: string | null;
  size?: number | null;
  originalUrl?: string | null;
}

export interface AlchemyNftRawMetadataAttribute {
  value: string | number | null;
  trait_type?: string;
}

export interface AlchemyNftRawMetadata {
  image?: string | null;
  name?: string | null;
  description?: string | null;
  attributes?: AlchemyNftRawMetadataAttribute[];
}

export interface AlchemyNftRaw {
  tokenUri?: string | null;
  metadata?: AlchemyNftRawMetadata;
}

export interface AlchemyNftCollectionInfo {
  name?: string | null;
  slug?: string | null;
  externalUrl?: string | null;
  bannerImageUrl?: string | null;
}

export interface AlchemyNftItem {
  address: string; // wallet address
  network: string; // network id
  tokenId: string;
  contractAddress: string;
  balance?: string;
  title?: string | null;
  description?: string | null;
  image?: AlchemyNftImage;
  raw?: AlchemyNftRaw;
  collection?: AlchemyNftCollectionInfo;
  tokenUri?: string | null;
  timeLastUpdated?: string | null;
  acquiredAt?: { blockTimestamp?: string; blockNumber?: string };
  error?: string | null;
}

export interface AlchemyNftsByAddressResponse {
  data: {
    nfts: AlchemyNftItem[];
    totalCount?: number;
    pageKey?: string;
  };
}

// NFT Contracts By Address
export interface AlchemyNftContractsByAddressRequest {
  addresses: AlchemyAddressNetworksPair[];
  pageKey?: string;
  pageSize?: number;
}

export interface AlchemyNftContractItem {
  address: string; // wallet address
  network: string;
  contractAddress: string;
  name?: string | null;
  symbol?: string | null;
  totalSupply?: string | null;
  type?: string | null; // ERC721 | ERC1155
}

export interface AlchemyNftContractsByAddressResponse {
  data: {
    contracts: AlchemyNftContractItem[];
    pageKey?: string;
  };
}
