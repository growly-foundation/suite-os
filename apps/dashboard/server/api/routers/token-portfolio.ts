import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { z } from 'zod';

import { SUPPORTED_CHAINS, getNetworkNameForApi } from '../../../core/chains';
import { AlchemyPortfolioService } from '../../../lib/services/alchemy.service';
import { FungibleAdapterService } from '../../../lib/services/fungible-adapter.service';
import { ZerionService } from '../../../lib/services/zerion.service';
import { PreferredFungibleApiProvider } from '../../../types/chains';
import { TokenPortfolioPositionsResponse } from '../../../types/token-portfolio';
import { minutes, withRedisCache } from '../../redis-cache';

const getZerionService = () => {
  const apiKey = process.env.ZERION_API_KEY || '';
  return new ZerionService(apiKey);
};

const getAlchemyService = () => {
  const apiKey = process.env.ALCHEMY_API_KEY || '';
  return new AlchemyPortfolioService(apiKey);
};

// Simple RPS limiter: allow max 2 calls per 1000ms (shared in-memory)
const CALL_WINDOW_MS = 500;
const MAX_CALLS_PER_WINDOW = 10;
let callTimestamps: number[] = [];

const waitForRateLimit = async () => {
  let now = Date.now();
  callTimestamps = callTimestamps.filter(ts => now - ts < CALL_WINDOW_MS);
  while (callTimestamps.length >= MAX_CALLS_PER_WINDOW) {
    const waitMs = CALL_WINDOW_MS - (now - callTimestamps[0]);
    await new Promise(res => setTimeout(res, Math.max(waitMs, 50)));
    now = Date.now();
    callTimestamps = callTimestamps.filter(ts => now - ts < CALL_WINDOW_MS);
  }
  callTimestamps.push(Date.now());
};

export const tokenPortfolioRouter = createTRPCRouter({
  // Unified fungible positions endpoint that switches between Zerion and Alchemy based on chain configuration
  positions: publicProcedure
    .input(
      z.object({
        address: z.string(),
        chainIds: z.string().optional(),
        currency: z.string().optional().default('usd'),
        useAllPages: z.boolean().optional().default(false),
        pageLimit: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
      })
    )
    .query(
      withRedisCache('unified:fungible-positions', minutes(5), async ({ input }) => {
        const { address, chainIds, currency, useAllPages, pageLimit, pageSize } = input;

        // Parse chain names from the comma-separated string
        const chainNameList = chainIds
          ? chainIds
              .split(',')
              .map(name => name.trim())
              .filter(name => name.length > 0)
          : []; // Default to ethereum if no chains specified

        // Map chain names to numeric IDs for feature lookup
        const chainIdList = chainNameList
          .map(name => {
            // Try multiple ways to find the chain
            const foundChain = SUPPORTED_CHAINS.find(
              c =>
                c.name.toLowerCase() === name.toLowerCase() ||
                c.name.toLowerCase().replace(' ', '') === name.toLowerCase()
            );
            return foundChain?.id;
          })
          .filter((id): id is number => id !== undefined);

        const providerByChain = FungibleAdapterService.getApiProviderByChain(chainIdList);

        // Group chains by preferred provider
        const zerionChainNames: string[] = [];
        const alchemyChainNames: string[] = [];

        for (let i = 0; i < chainNameList.length; i++) {
          const chainName = chainNameList[i];
          const chainId = chainIdList[i];
          if (!chainId) continue;

          const provider = providerByChain[chainId];
          if (provider === PreferredFungibleApiProvider.ALCHEMY) {
            alchemyChainNames.push(chainName);
          } else {
            zerionChainNames.push(chainName);
          }
        }

        const result: TokenPortfolioPositionsResponse = {
          positions: [],
          totalUsdValue: 0,
        };

        // Fetch from Zerion if needed
        if (zerionChainNames.length > 0) {
          const zerionApiChainNames = zerionChainNames.map(name =>
            getNetworkNameForApi(name, 'zerion')
          );

          if (zerionApiChainNames.length > 0) {
            const zerionParams: any = {
              currency,
              'filter[chain_ids]': zerionApiChainNames.join(','),
              'filter[positions]': 'only_simple',
              ...(pageSize ? { 'page[size]': pageSize } : {}),
            };

            await waitForRateLimit();
            const zerionPositions = useAllPages
              ? await getZerionService().getAllFungiblePositions(address, zerionParams, pageLimit)
              : await getZerionService().getFungiblePositions(address, zerionParams);

            const zerionResult = FungibleAdapterService.transformZerionPositions(
              zerionPositions || [],
              address
            );

            result.positions.push(...zerionResult.positions);
            result.totalUsdValue += zerionResult.totalUsdValue;
          }
        }

        // Fetch from Alchemy if needed
        if (alchemyChainNames.length > 0) {
          const alchemyNetworks = alchemyChainNames
            .map(name => getNetworkNameForApi(name, 'alchemy'))
            .filter(network => network.length > 0);

          if (alchemyNetworks.length === 0) {
            console.warn('No valid networks found for Alchemy API, skipping Alchemy fetch');
          } else {
            const alchemyPayload = {
              addresses: [{ address, networks: alchemyNetworks }],
              withMetadata: true,
              withPrices: true,
              includeNativeTokens: true,
              includeErc20Tokens: true,
            };

            const alchemyResponse = await getAlchemyService().getAllTokensByAddress(alchemyPayload);
            const alchemyResult = await FungibleAdapterService.transformAlchemyTokens(
              alchemyResponse.data?.tokens || [],
              address,
              alchemyNetworks
            );

            result.positions.push(...alchemyResult.positions);
            result.totalUsdValue += alchemyResult.totalUsdValue;
          }
        }

        return {
          address,
          totalUsdValue: result.totalUsdValue,
          positions: result.positions,
          // Metadata about which providers were used
          providersUsed: {
            zerion: zerionChainNames.length > 0,
            alchemy: alchemyChainNames.length > 0,
          },
        };
      })
    ),
});
