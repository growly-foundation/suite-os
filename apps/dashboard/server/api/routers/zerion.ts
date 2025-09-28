import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { z } from 'zod';

import { ZerionService } from '../../../lib/services/zerion.service';
import { minutes, withRedisCache } from '../../redis-cache';

const getZerionService = () => {
  const apiKey = process.env.ZERION_API_KEY || '';
  return new ZerionService(apiKey);
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

// Shared helpers
const clampPageSize = (n?: number) => Math.min(Math.max(n ?? 50, 1), 50);

function buildTxParamsFromUnified(input: {
  currency?: string;
  chainIds?: string;
  operationTypes?: string;
  days?: number;
  minMinedAt?: number;
  maxMinedAt?: number;
  pageSize?: number;
}) {
  // Timestamp in milliseconds
  const sinceSec = input.minMinedAt ?? Date.now() - (input.days ?? 30) * 24 * 60 * 60 * 1000;
  const params: any = {
    currency: input.currency,
    ...(input.chainIds ? { 'filter[chain_ids]': input.chainIds } : {}),
    ...(input.operationTypes ? { 'filter[operation_types]': input.operationTypes } : {}),
    'filter[min_mined_at]': sinceSec,
    ...(input.maxMinedAt ? { 'filter[max_mined_at]': input.maxMinedAt } : {}),
    sort: '-mined_at',
    'page[size]': clampPageSize(input.pageSize),
  };
  return params;
}

function transformZerionTransactions(data: any[]) {
  const items = (data || []).map(tx => {
    const attr = (tx as any).attributes || {};
    const rel = (tx as any).relationships || {};

    // Flatten transfers
    const transfers = (attr.transfers || []).map((t: any) => {
      const isNFT = !!t.nft_info;
      return {
        from: t.sender || t.from,
        to: t.recipient || t.to,
        symbol: isNFT ? t.nft_info?.name : t.fungible_info?.symbol,
        decimals: isNFT ? 0 : (t.quantity?.decimals ?? 18),
        value: isNFT ? (t.quantity?.float ?? 1) : (t.quantity?.float ?? 0),
        isNFT,
        tokenId: t.nft_info?.token_id,
        contract: t.nft_info?.contract_address,
        image: t.nft_info?.content?.preview?.url,
        // Common fields for ActivityData
        tokenDecimal: String(isNFT ? 0 : (t.quantity?.decimals ?? 18)),
        timestamp: Math.floor(new Date(attr.mined_at || Date.now()).getTime() / 1000),
        operationType: attr.operation_type,
      };
    });

    return {
      id: (tx as any).id,
      hash: attr.hash,
      minedAt: attr.mined_at,
      from: attr.sent_from,
      to: attr.sent_to,
      status: attr.status,
      operationType: attr.operation_type,
      chainId: rel?.chain?.data?.id,
      protocol: attr.protocol?.name,
      dapp: attr.dapp?.name,
      transfers,
    };
  });

  // latestActivity = first transfer of the latest tx
  const latestTx = items[0];
  const latestTransfer = latestTx?.transfers?.[0];
  const latestActivity = latestTransfer
    ? {
        from: latestTransfer.from,
        to: latestTransfer.to,
        value: latestTransfer.value,
        symbol: latestTransfer.symbol ?? 'ETH',
        tokenDecimal: latestTransfer.tokenDecimal,
        timestamp: latestTransfer.timestamp,
        operationType: latestTransfer.operationType,
        isNFT: latestTransfer.isNFT,
        image: latestTransfer.image,
      }
    : undefined;

  return {
    totalCount: items.length,
    latestActivity,
    items,
  } as any;
}

export const zerionRouter = createTRPCRouter({
  balanceChart: publicProcedure
    .input(
      z.object({
        address: z.string(),
        params: z
          .object({
            currency: z.string().optional(),
            period: z.string().optional(),
            'filter[chain_ids]': z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { address, params } }) => {
      const svc = getZerionService();
      return svc.getBalanceChart(address, params);
    }),

  portfolio: publicProcedure
    .input(
      z.object({
        address: z.string(),
        params: z
          .object({
            currency: z.string().optional(),
            'filter[chain_ids]': z.string().optional(),
            'filter[positions]': z.string().optional(),
            'filter[trash]': z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { address, params } }) => {
      const svc = getZerionService();
      return svc.getPortfolio(address, params);
    }),

  positions: publicProcedure
    .input(
      z.object({
        address: z.string(),
        params: z
          .object({
            currency: z.string().optional(),
            'filter[chain_ids]': z.string().optional(),
            'filter[positions]': z.string().optional(),
            'filter[trash]': z.string().optional(),
            'filter[protocol]': z.string().optional(),
            'filter[dapp]': z.string().optional(),
            'filter[fungible]': z.string().optional(),
            sort: z.string().optional(),
            page: z.number().optional(),
            'page[size]': z.number().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { address, params } }) => {
      const svc = getZerionService();
      return svc.getFungiblePositions(address, params);
    }),

  transactions: publicProcedure
    .input(
      z.object({
        address: z.string(),
        currency: z.string().optional().default('usd'),
        chainIds: z.string().optional(),
        operationTypes: z.string().optional(),
        days: z.number().int().positive().optional().default(30),
        minMinedAt: z.number().optional(),
        maxMinedAt: z.number().optional(),
        pageSize: z.number().int().positive().optional().default(50),
        pageLimit: z.number().int().positive().optional().default(10),
      })
    )
    .query(
      withRedisCache('zerion:txs-unified', minutes(5), async ({ input }) => {
        const { address, pageLimit } = input;
        const params = buildTxParamsFromUnified(input);
        await waitForRateLimit();
        const data = await getZerionService().getAllTransactions(address, params, pageLimit);
        return transformZerionTransactions(data);
      })
    ),

  nftPositions: publicProcedure
    .input(
      z.object({
        address: z.string(),
        params: z
          .object({
            currency: z.string().optional(),
            'filter[chain_ids]': z.string().optional(),
            'filter[nft_collection]': z.string().optional(),
            'filter[nft]': z.string().optional(),
            sort: z.string().optional(),
            page: z.number().optional(),
            'page[size]': z.number().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { address, params } }) => {
      const svc = getZerionService();
      return svc.getNftPositions(address, params);
    }),

  nftCollections: publicProcedure
    .input(
      z.object({
        address: z.string(),
        params: z
          .object({
            currency: z.string().optional(),
            'filter[chain_ids]': z.string().optional(),
            sort: z.string().optional(),
            page: z.number().optional(),
            'page[size]': z.number().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { address, params } }) => {
      const svc = getZerionService();
      return svc.getNftCollections(address, params);
    }),

  nftPortfolio: publicProcedure
    .input(
      z.object({
        address: z.string(),
        params: z
          .object({
            currency: z.string().optional(),
            'filter[chain_ids]': z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { address, params } }) => {
      const svc = getZerionService();
      return svc.getNftPortfolio(address, params);
    }),

  pnl: publicProcedure
    .input(
      z.object({
        address: z.string(),
        params: z
          .object({
            currency: z.string().optional(),
            'filter[chain_ids]': z.string().optional(),
            'filter[fungible]': z.string().optional(),
            'filter[from_date]': z.string().optional(),
            'filter[to_date]': z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { address, params } }) => {
      const svc = getZerionService();
      return svc.getPnL(address, params);
    }),

  nftPositionsWithTotal: publicProcedure
    .input(
      z.object({
        address: z.string(),
        chainIds: z.string().optional(),
        collectionIds: z.string().optional(),
        currency: z.string().optional().default('usd'),
        useAllPages: z.boolean().optional().default(true), // Default to true for better data coverage
        pageLimit: z.number().int().positive().optional().default(10),
        pageSize: z.number().int().positive().optional().default(50), // Reduced from 200 to avoid API limits
      })
    )
    .query(
      withRedisCache('zerion:nft-positions-with-total', minutes(5), async ({ input }) => {
        const { address, chainIds, collectionIds, currency, useAllPages, pageLimit, pageSize } =
          input;
        const svc = getZerionService();

        // Build params with correct parameter names
        const paramsBase: any = {
          currency,
          ...(chainIds ? { 'filter[chain_ids]': chainIds } : {}),
          ...(collectionIds ? { 'filter[collections_ids]': collectionIds } : {}),
          ...(pageSize ? { 'page[size]': Math.min(pageSize, 100) } : {}), // Clamp page size
        };

        try {
          await waitForRateLimit();
          const nftPositions = useAllPages
            ? await svc.getAllNftPositions(address, paramsBase, pageLimit)
            : await svc.getNftPositions(address, paramsBase);

          const totalUsdValue = nftPositions.reduce(
            (acc: number, p: any) => acc + (Number(p?.attributes?.value) || 0),
            0
          );

          return { address, totalUsdValue, nftPositions } as any;
        } catch (error: any) {
          console.error(`[NFT Positions] Error for address ${address}:`, error?.message || error);

          // Return empty data instead of throwing to prevent UI breaks
          return {
            address,
            totalUsdValue: 0,
            nftPositions: [],
          } as any;
        }
      })
    ),

  fungiblePositionsWithTotal: publicProcedure
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
      withRedisCache('zerion:fungible-positions-with-total', minutes(5), async ({ input }) => {
        const { address, chainIds, currency, useAllPages, pageLimit, pageSize } = input;
        const svc = getZerionService();
        // Only get wallet balance token right now -> Enable DeFi positions later
        const paramsBase: any = {
          currency,
          ...(chainIds ? { 'filter[chain_ids]': chainIds } : {}),
          'filter[positions]': 'only_simple',
          ...(pageSize ? { 'page[size]': pageSize } : {}),
        };

        await waitForRateLimit();
        const positions = useAllPages
          ? await svc.getAllFungiblePositions(address, paramsBase, pageLimit)
          : await svc.getFungiblePositions(address, paramsBase);

        const totalUsdValue = positions.reduce(
          (acc: number, p: any) => acc + (Number(p?.attributes?.value) || 0),
          0
        );

        return { address, totalUsdValue, positions } as any;
      })
    ),
});
