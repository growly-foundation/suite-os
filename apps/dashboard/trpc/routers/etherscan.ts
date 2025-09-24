/**
 * Etherscan tRPC Router
 * Provides cached access to Etherscan API endpoints
 */
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { getEtherscanService } from '../../lib/services/etherscan.service';
import { baseProcedure } from '../init';
import { minutes, withRedisCache } from '../redis-cache';

// Input validation schemas
const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');
const blockRangeSchema = z.object({
  startBlock: z.number().int().min(0).optional(),
  endBlock: z.number().int().min(0).optional(),
});
const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  offset: z.number().int().positive().max(10000).optional().default(10000),
  sort: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const etherscanRouter = {
  /**
   * Get normal transactions for an address
   */
  getNormalTransactions: baseProcedure
    .input(
      z.object({
        address: addressSchema,
        chainId: z.number().int().positive(),
        ...blockRangeSchema.shape,
        ...paginationSchema.shape,
      })
    )
    .query(
      withRedisCache('etherscan:normal-txs', minutes(10), async ({ input }) => {
        const { address, chainId, startBlock, endBlock, page, offset, sort } = input;

        try {
          const service = getEtherscanService(process.env.ETHERSCAN_API_KEY!);
          const transactions = await service.getNormalTransactions({
            address,
            chainId,
            startblock: startBlock,
            endblock: endBlock,
            page,
            offset,
            sort,
          });

          return {
            transactions,
            totalCount: transactions.length,
            hasMore: transactions.length === offset,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch normal transactions: ${error.message}`,
          });
        }
      })
    ),

  /**
   * Get ERC20 token transfers for an address
   */
  getERC20Transfers: baseProcedure
    .input(
      z.object({
        address: addressSchema,
        chainId: z.number().int().positive(),
        contractAddress: z.string().optional(),
        ...blockRangeSchema.shape,
        ...paginationSchema.shape,
      })
    )
    .query(
      withRedisCache('etherscan:erc20-transfers', minutes(10), async ({ input }) => {
        const { address, chainId, contractAddress, startBlock, endBlock, page, offset, sort } =
          input;

        try {
          const service = getEtherscanService(process.env.ETHERSCAN_API_KEY!);
          const transfers = await service.getERC20Transfers({
            address,
            chainId,
            contractaddress: contractAddress,
            startblock: startBlock,
            endblock: endBlock,
            page,
            offset,
            sort,
          });

          return {
            transfers,
            totalCount: transfers.length,
            hasMore: transfers.length === offset,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch ERC20 transfers: ${error.message}`,
          });
        }
      })
    ),

  /**
   * Get ERC721 token transfers for an address
   */
  getERC721Transfers: baseProcedure
    .input(
      z.object({
        address: addressSchema,
        chainId: z.number().int().positive(),
        contractAddress: z.string().optional(),
        ...blockRangeSchema.shape,
        ...paginationSchema.shape,
      })
    )
    .query(
      withRedisCache('etherscan:erc721-transfers', minutes(10), async ({ input }) => {
        const { address, chainId, contractAddress, startBlock, endBlock, page, offset, sort } =
          input;

        try {
          const service = getEtherscanService(process.env.ETHERSCAN_API_KEY!);
          const transfers = await service.getERC721Transfers({
            address,
            chainId,
            contractaddress: contractAddress,
            startblock: startBlock,
            endblock: endBlock,
            page,
            offset,
            sort,
          });

          return {
            transfers,
            totalCount: transfers.length,
            hasMore: transfers.length === offset,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch ERC721 transfers: ${error.message}`,
          });
        }
      })
    ),

  /**
   * Get ERC1155 token transfers for an address
   */
  getERC1155Transfers: baseProcedure
    .input(
      z.object({
        address: addressSchema,
        chainId: z.number().int().positive(),
        contractAddress: z.string().optional(),
        ...blockRangeSchema.shape,
        ...paginationSchema.shape,
      })
    )
    .query(
      withRedisCache('etherscan:erc1155-transfers', minutes(10), async ({ input }) => {
        const { address, chainId, contractAddress, startBlock, endBlock, page, offset, sort } =
          input;

        try {
          const service = getEtherscanService(process.env.ETHERSCAN_API_KEY!);
          const transfers = await service.getERC1155Transfers({
            address,
            chainId,
            contractaddress: contractAddress,
            startblock: startBlock,
            endblock: endBlock,
            page,
            offset,
            sort,
          });

          return {
            transfers,
            totalCount: transfers.length,
            hasMore: transfers.length === offset,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch ERC1155 transfers: ${error.message}`,
          });
        }
      })
    ),

  /**
   * Get all token transfers (ERC20, ERC721, ERC1155) for an address
   */
  getAllTokenTransfers: baseProcedure
    .input(
      z.object({
        address: addressSchema,
        chainId: z.number().int().positive(),
        contractAddress: z.string().optional(),
        ...blockRangeSchema.shape,
        ...paginationSchema.shape,
      })
    )
    .query(
      withRedisCache('etherscan:all-token-transfers', minutes(10), async ({ input }) => {
        const { address, chainId, contractAddress, startBlock, endBlock, page, offset, sort } =
          input;

        try {
          const service = getEtherscanService(process.env.ETHERSCAN_API_KEY!);
          const { erc20, erc721, erc1155 } = await service.getAllTokenTransfers({
            address,
            chainId,
            contractaddress: contractAddress,
            startblock: startBlock,
            endblock: endBlock,
            page,
            offset,
            sort,
          });

          return {
            erc20: {
              transfers: erc20,
              totalCount: erc20.length,
            },
            erc721: {
              transfers: erc721,
              totalCount: erc721.length,
            },
            erc1155: {
              transfers: erc1155,
              totalCount: erc1155.length,
            },
            totalTransfers: erc20.length + erc721.length + erc1155.length,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch all token transfers: ${error.message}`,
          });
        }
      })
    ),

  /**
   * Get address funding information (single chain)
   */
  getAddressFundedBy: baseProcedure
    .input(
      z.object({
        address: addressSchema,
        chainId: z.number().int().positive(),
      })
    )
    .query(
      withRedisCache('etherscan:funding-info', minutes(60), async ({ input }) => {
        const { address, chainId } = input;

        try {
          const service = getEtherscanService(process.env.ETHERSCAN_API_KEY!);
          const fundingInfo = await service.getAddressFundedBy({ address, chainId });

          return {
            fundingInfo,
            hasFundingInfo: !!fundingInfo,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch funding information: ${error.message}`,
          });
        }
      })
    ),

  /**
   * Get address funding information across multiple chains
   */
  getAddressFundedByAcrossChains: baseProcedure
    .input(
      z.object({
        address: addressSchema,
        chainIds: z.array(z.number().int().positive()).min(1),
      })
    )
    .query(
      withRedisCache('etherscan:funding-info-multi', minutes(60), async ({ input }) => {
        const { address, chainIds } = input;

        try {
          const service = getEtherscanService(process.env.ETHERSCAN_API_KEY!);
          const results = await service.getAddressFundedByAcrossChains(address, chainIds);
          return results;
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch multi-chain funding information: ${error.message}`,
          });
        }
      })
    ),
};
