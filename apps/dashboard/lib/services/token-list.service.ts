export interface TokenListToken {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  extensions?: {
    bridgeInfo?: Record<string, { tokenAddress: string }>;
  };
}

export interface TokenListResponse {
  name: string;
  timestamp: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  tags: Record<string, any>;
  logoURI: string;
  keywords: string[];
  tokens: TokenListToken[];
}

/**
 * Service for fetching and managing Uniswap token list metadata
 */
export class TokenListService {
  private static readonly UNISWAP_TOKEN_LIST_URL = 'https://ipfs.io/ipns/tokens.uniswap.org';
  private static tokenListCache: TokenListResponse | null = null;
  private static cacheTimestamp = 0;
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  /**
   * Fetch the complete token list from Uniswap
   */
  static async fetchTokenList(): Promise<TokenListResponse> {
    const response = await fetch(this.UNISWAP_TOKEN_LIST_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch token list: ${response.status} ${response.statusText}`);
    }

    const data: TokenListResponse = await response.json();
    return data;
  }

  /**
   * Get cached token list or fetch new one if cache is expired
   */
  static async getTokenList(): Promise<TokenListResponse> {
    const now = Date.now();

    // Check if we have a valid cached version
    if (this.tokenListCache && now - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.tokenListCache;
    }

    // Fetch new token list
    try {
      this.tokenListCache = await this.fetchTokenList();
      this.cacheTimestamp = now;
      return this.tokenListCache;
    } catch (error) {
      // If fetch fails and we have cached data, return cached data
      if (this.tokenListCache) {
        console.warn('Failed to fetch fresh token list, using cached version:', error);
        return this.tokenListCache;
      }
      throw error;
    }
  }

  /**
   * Find token metadata by chain ID and address
   */
  static async findTokenMetadata(
    chainId: number | string,
    address: string
  ): Promise<TokenListToken | null> {
    const tokenList = await this.getTokenList();
    const numericChainId = typeof chainId === 'string' ? parseInt(chainId) : chainId;

    // Find token in the list
    const token = tokenList.tokens.find(
      t => t.chainId === numericChainId && t.address.toLowerCase() === address.toLowerCase()
    );

    return token || null;
  }

  /**
   * Get logo URI for a token if available in the token list
   */
  static async getTokenLogoURI(chainId: number | string, address: string): Promise<string | null> {
    const token = await this.findTokenMetadata(chainId, address);
    return token?.logoURI || null;
  }

  /**
   * Enrich token metadata with data from token list
   */
  static async enrichTokenMetadata(
    chainId: number | string,
    address: string,
    currentMetadata: {
      name?: string;
      symbol?: string;
      logoURI?: string;
      decimals?: number;
    }
  ): Promise<{
    name?: string;
    symbol?: string;
    logoURI?: string;
    decimals?: number;
  }> {
    const tokenListToken = await this.findTokenMetadata(chainId, address);

    if (!tokenListToken) {
      return currentMetadata;
    }

    return {
      name: currentMetadata.name || tokenListToken.name,
      symbol: currentMetadata.symbol || tokenListToken.symbol,
      logoURI: currentMetadata.logoURI || tokenListToken.logoURI,
      decimals: currentMetadata.decimals || tokenListToken.decimals,
    };
  }

  /**
   * Bulk enrich multiple tokens with metadata from token list
   */
  static async enrichMultipleTokensMetadata(
    tokens: Array<{
      chainId: number | string;
      tokenAddress: string | null;
      currentMetadata: {
        name?: string;
        symbol?: string;
        logoURI?: string;
        decimals?: number;
      };
    }>
  ): Promise<
    Array<{
      name?: string;
      symbol?: string;
      logoURI?: string;
      decimals?: number;
    }>
  > {
    const tokenList = await this.getTokenList();

    return tokens.map(({ chainId, tokenAddress, currentMetadata }) => {
      // Skip if no token address (native tokens)
      if (!tokenAddress) {
        return currentMetadata;
      }

      const numericChainId = typeof chainId === 'string' ? parseInt(chainId) : chainId;

      // Find token in the list
      const tokenListToken = tokenList.tokens.find(
        t => t.chainId === numericChainId && t.address.toLowerCase() === tokenAddress.toLowerCase()
      );

      if (!tokenListToken) {
        return currentMetadata;
      }

      return {
        name: currentMetadata.name || tokenListToken.name,
        symbol: currentMetadata.symbol || tokenListToken.symbol,
        logoURI: currentMetadata.logoURI || tokenListToken.logoURI,
        decimals: currentMetadata.decimals || tokenListToken.decimals,
      };
    });
  }

  /**
   * Clear the cache (useful for testing or manual refresh)
   */
  static clearCache(): void {
    this.tokenListCache = null;
    this.cacheTimestamp = 0;
  }
}
