import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { z } from 'zod';

import { AlchemyPortfolioService } from '../../../lib/services/alchemy.service';

const getAlchemyService = () => {
  const apiKey = process.env.ALCHEMY_API_KEY || '';
  return new AlchemyPortfolioService(apiKey);
};

export const alchemyRouter = createTRPCRouter({
  tokensByAddress: publicProcedure
    .input(
      z.object({
        addresses: z.array(z.object({ address: z.string(), networks: z.array(z.string()) })),
        withMetadata: z.boolean().optional(),
        withPrices: z.boolean().optional(),
        includeNativeTokens: z.boolean().optional(),
        includeErc20Tokens: z.boolean().optional(),
        pageKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const svc = getAlchemyService();
      return svc.getTokensByAddress(input);
    }),

  tokenBalancesByAddress: publicProcedure
    .input(
      z.object({
        addresses: z.array(z.object({ address: z.string(), networks: z.array(z.string()) })),
        includeNativeTokens: z.boolean().optional(),
        includeErc20Tokens: z.boolean().optional(),
        pageKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const svc = getAlchemyService();
      return svc.getTokenBalancesByAddress(input);
    }),

  nftsByAddress: publicProcedure
    .input(
      z.object({
        addresses: z.array(z.object({ address: z.string(), networks: z.array(z.string()) })),
        withMetadata: z.boolean().optional(),
        pageKey: z.string().optional(),
        pageSize: z.number().optional(),
        orderBy: z.literal('transferTime').optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const svc = getAlchemyService();
      return svc.getNftsByAddress(input);
    }),

  nftContractsByAddress: publicProcedure
    .input(
      z.object({
        addresses: z.array(z.object({ address: z.string(), networks: z.array(z.string()) })),
        pageKey: z.string().optional(),
        pageSize: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const svc = getAlchemyService();
      return svc.getNftContractsByAddress(input);
    }),
});
