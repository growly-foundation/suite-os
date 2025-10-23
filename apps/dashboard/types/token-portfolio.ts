// Unified Fungible Position Types for API Adapter

export interface TokenPortfolioPosition {
  id: string;
  type: string;
  chainId: string;
  chainName?: string;
  address: string; // wallet address
  tokenAddress: string | null; // null for native tokens
  tokenBalance: string; // raw balance
  tokenBalanceFloat: number; // parsed balance
  value: number; // USD value
  price: number; // current price per token in USD
  decimals: number;
  symbol: string;
  name: string;
  logo?: string | null;
  positionType: 'wallet' | 'deposit' | 'reward' | 'staked' | 'airdrop' | 'margin' | 'unknown';
  protocol?: string | null;
  isVerified?: boolean;
  isDisplayable: boolean;
  isNativeToken: boolean;
  changes?: {
    absolute_1d: number;
    percent_1d: number;
  } | null;
  updatedAt: string;
  // Source API metadata
  source: 'zerion' | 'alchemy';
  // Raw API response data (for debugging/extensibility)
  rawData?: any;
}

export interface TokenPortfolioPositionsResponse {
  positions: TokenPortfolioPosition[];
  totalUsdValue: number;
  // Metadata about which providers were used
  providersUsed?: {
    zerion: boolean;
    alchemy: boolean;
  };
}
