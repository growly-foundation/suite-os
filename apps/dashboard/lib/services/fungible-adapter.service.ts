import { hexToDecimal } from '@/utils/number';
import { formatUnits } from 'viem';

import { getPreferredFungibleApiProvider } from '../../core/chain-features';
import { NETWORK_NAME_MAPPINGS, SUPPORTED_CHAINS } from '../../core/chains';
import { AlchemyTokenWithPrice } from '../../types/alchemy';
import { PreferredFungibleApiProvider } from '../../types/chains';
import {
  TokenPortfolioPosition,
  TokenPortfolioPositionsResponse,
} from '../../types/token-portfolio';
import { ZerionFungiblePosition } from '../../types/zerion';
import { TokenListService } from './token-list.service';

/**
 * Service for adapting different fungible token API responses to a unified format
 */
export class FungibleAdapterService {
  /**
   * Transform Zerion fungible positions to unified format
   */
  static transformZerionPositions(
    positions: ZerionFungiblePosition[],
    walletAddress: string
  ): TokenPortfolioPositionsResponse {
    const unifiedPositions: TokenPortfolioPosition[] = [];

    for (const position of positions) {
      const attributes = position.attributes;
      const relationships = position.relationships;

      // Get chain ID from relationships
      const zerionChainId = relationships?.chain?.data?.id || 'ethereum';
      const chainInfo = SUPPORTED_CHAINS.find(
        c => c.name.toLowerCase() === zerionChainId.toLowerCase()
      );
      const numericChainId = chainInfo?.id?.toString() || '1';

      // Get token address from implementations
      const implementation = attributes.fungible_info.implementations.find(
        impl => impl.chain_id === zerionChainId
      );
      const tokenAddress = implementation?.address || null;

      // Parse balance
      const balanceFloat = parseFloat(attributes.quantity.float.toString());
      const balanceRaw = attributes.quantity.int;

      // Determine position type
      const positionType = attributes.position_type === 'wallet' ? 'wallet' : 'unknown';

      unifiedPositions.push({
        id: position.id,
        type: position.type,
        chainId: numericChainId,
        chainName: zerionChainId,
        address: walletAddress,
        tokenAddress,
        tokenBalance: balanceRaw,
        tokenBalanceFloat: balanceFloat,
        value: attributes.value || 0,
        price: attributes.price || 0,
        decimals: attributes.quantity.decimals,
        symbol: attributes.fungible_info.symbol,
        name: attributes.fungible_info.name,
        logo: attributes.fungible_info.icon?.url || null,
        positionType,
        protocol: attributes.protocol,
        isVerified: attributes.fungible_info.flags.verified,
        isDisplayable: attributes.flags.displayable,
        isNativeToken: tokenAddress === null,
        changes: attributes.changes,
        updatedAt: attributes.updated_at,
        source: 'zerion',
        rawData: position,
      });
    }

    const totalUsdValue = unifiedPositions.reduce((sum, pos) => sum + pos.value, 0);

    return {
      positions: unifiedPositions,
      totalUsdValue,
    };
  }

  /**
   * Transform Alchemy token data to unified format
   */
  static async transformAlchemyTokens(
    tokens: AlchemyTokenWithPrice[],
    walletAddress: string,
    networks: string[]
  ): Promise<TokenPortfolioPositionsResponse> {
    const unifiedPositions: TokenPortfolioPosition[] = [];

    // Safety checks
    if (!networks || networks.length === 0) {
      return { positions: [], totalUsdValue: 0 };
    }
    if (!tokens || tokens.length === 0) {
      return { positions: [], totalUsdValue: 0 };
    }

    // Build reverse mapping from Alchemy API names to internal chain names
    const reverseAlchemyMapping: Record<string, string> = {};
    for (const [internalName, apiName] of Object.entries(NETWORK_NAME_MAPPINGS.alchemy)) {
      reverseAlchemyMapping[apiName] = internalName;
    }

    for (const token of tokens) {
      // Map Alchemy network name back to internal chain name
      let chainId = '1'; // default to mainnet
      let chainName = 'ethereum';

      if (token.network) {
        // Use reverse mapping to get internal name from Alchemy API name
        const internalChainName = reverseAlchemyMapping[token.network];

        if (internalChainName) {
          // Find the chain in SUPPORTED_CHAINS using the internal name
          const chain = SUPPORTED_CHAINS.find(
            c => c.name.toLowerCase() === internalChainName.toLowerCase()
          );
          if (chain) {
            chainId = chain.id.toString();
            chainName = internalChainName;
          }
        }
      }

      const balanceRaw = hexToDecimal(token.tokenBalance);
      const balanceFloat = parseFloat(formatUnits(balanceRaw, token.tokenMetadata?.decimals || 18));

      // Get price from first available price (usually USD)
      const usdPrice = token.tokenPrices?.find(p => p.currency === 'usd');
      const price = usdPrice ? parseFloat(usdPrice.value) : 0;
      const value = balanceFloat * price;

      // Determine if native token
      const isNativeToken = token.tokenAddress === null;

      // Map position type (Alchemy doesn't provide this, default to wallet)
      const positionType: TokenPortfolioPosition['positionType'] = 'wallet';

      unifiedPositions.push({
        id: `${token.network}-${token.tokenAddress || 'native'}-${walletAddress}`,
        type: 'fungible_position',
        chainId,
        chainName,
        address: walletAddress,
        tokenAddress: token.tokenAddress,
        tokenBalance: balanceFloat.toString(),
        tokenBalanceFloat: balanceFloat,
        value,
        price,
        decimals: token.tokenMetadata.decimals || 18,
        symbol: token.tokenMetadata.symbol || (isNativeToken ? 'ETH' : ''),
        name: token.tokenMetadata.name || (isNativeToken ? 'Ethereum' : ''),
        logo:
          token.tokenMetadata.logo || (isNativeToken ? '/logos/chains/ethereum-logo.svg' : null),
        positionType,
        protocol: null, // Alchemy doesn't provide protocol info
        isVerified: true, // Assume verified for now, Alchemy doesn't provide this
        isDisplayable: true,
        isNativeToken,
        changes: null, // Alchemy doesn't provide price change data
        updatedAt: usdPrice?.lastUpdatedAt || new Date().toISOString(),
        source: 'alchemy',
        rawData: token,
      });
    }

    // Enrich tokens with metadata from Uniswap token list for missing data
    const tokensToEnrich = unifiedPositions
      .map((pos, index) => ({
        originalIndex: index,
        chainId: pos.chainId,
        tokenAddress: pos.tokenAddress,
        currentMetadata: {
          name: pos.name,
          symbol: pos.symbol,
          logoURI: pos.logo || undefined,
          decimals: pos.decimals,
        },
      }))
      .filter(item => item.tokenAddress); // Only non-native tokens

    if (tokensToEnrich.length > 0) {
      try {
        const enrichedMetadata = await TokenListService.enrichMultipleTokensMetadata(
          tokensToEnrich.map(({ chainId, tokenAddress, currentMetadata }) => ({
            chainId,
            tokenAddress: tokenAddress!,
            currentMetadata,
          }))
        );

        // Apply the enriched metadata back to the positions using original index
        tokensToEnrich.forEach(({ originalIndex }, enrichIndex) => {
          const position = unifiedPositions[originalIndex];
          const enriched = enrichedMetadata[enrichIndex];
          if (enriched) {
            position.name = enriched.name || position.name;
            position.symbol = enriched.symbol || position.symbol;
            position.logo = enriched.logoURI || position.logo;
            position.decimals = enriched.decimals || position.decimals;
          }
        });
      } catch (error) {
        // Log error but don't fail the entire process
        console.warn('Failed to enrich tokens with Uniswap token list metadata:', error);
      }
    }

    const totalUsdValue = unifiedPositions.reduce((sum, pos) => sum + pos.value, 0);

    return {
      positions: unifiedPositions.filter(pos => pos.value > 0).sort((a, b) => b.value - a.value), // Filter out positions with no value and sort by value
      totalUsdValue,
    };
  }

  /**
   * Get the preferred API provider for a set of chain IDs
   */
  static getPreferredApiProvider(chainIds: number[]): PreferredFungibleApiProvider {
    if (!chainIds || chainIds.length === 0) return PreferredFungibleApiProvider.ZERION;

    // If all chains prefer the same provider, use that
    const providers = chainIds.map(id => getPreferredFungibleApiProvider(id));
    const allSame = providers.every(p => p === providers[0]);

    if (allSame) {
      return providers[0];
    }

    // If mixed, prefer alchemy if any chain prefers it (since user wants higher RPS for specific chains)
    return providers.includes(PreferredFungibleApiProvider.ALCHEMY)
      ? PreferredFungibleApiProvider.ALCHEMY
      : PreferredFungibleApiProvider.ZERION;
  }

  /**
   * Determine which chains should use which API based on configuration
   */
  static getApiProviderByChain(chainIds: number[]): Record<number, PreferredFungibleApiProvider> {
    const providerByChain: Record<number, PreferredFungibleApiProvider> = {};

    if (!chainIds || chainIds.length === 0) {
      return providerByChain;
    }

    for (const chainId of chainIds) {
      providerByChain[chainId] = getPreferredFungibleApiProvider(chainId);
    }

    return providerByChain;
  }
}
