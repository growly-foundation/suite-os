import { z } from 'zod';

import { blockscoutServices } from '../../lib/services/blockscount.service';
import { baseProcedure, createTRPCRouter } from '../init';

export const blockscoutRouter = createTRPCRouter({
  // Get address counters for a single network
  getAddressCounters: baseProcedure
    .input(
      z.object({
        address: z.string(),
        network: z.enum(['ethereum', 'optimism', 'base', 'ethereumSepolia']).default('ethereum'),
      })
    )
    .query(async ({ input: { address, network } }) => {
      const service = blockscoutServices[network];
      return service.getAddressCounters(address);
    }),

  // Get combined address counters across multiple networks
  getCombinedAddressCounters: baseProcedure
    .input(
      z.object({
        address: z.string(),
        networks: z
          .array(z.enum(['ethereum', 'optimism', 'base', 'ethereumSepolia']))
          .default(['ethereum', 'base']),
      })
    )
    .query(async ({ input: { address, networks } }) => {
      const results = await Promise.allSettled(
        networks.map(async network => {
          const service = blockscoutServices[network];
          const counters = await service.getAddressCounters(address);
          return {
            network,
            counters,
          };
        })
      );

      const combined = {
        totalTransactions: 0,
        totalTokenTransfers: 0,
        totalGasUsage: 0,
        totalValidations: 0,
        networkData: {} as Record<string, any>,
      };

      results.forEach((result, index) => {
        const network = networks[index];
        if (result.status === 'fulfilled') {
          const { counters } = result.value;
          combined.totalTransactions += parseInt(counters.transactions_count);
          combined.totalTokenTransfers += parseInt(counters.token_transfers_count);
          combined.totalGasUsage += parseInt(counters.gas_usage_count);
          combined.totalValidations += parseInt(counters.validations_count);
          combined.networkData[network] = {
            transactions: parseInt(counters.transactions_count),
            tokenTransfers: parseInt(counters.token_transfers_count),
            gasUsage: parseInt(counters.gas_usage_count),
            validations: parseInt(counters.validations_count),
          };
        } else {
          console.error(`Failed to fetch data for ${network}:`, result.reason);
          combined.networkData[network] = {
            error: result.reason?.message || 'Failed to fetch data',
          };
        }
      });

      return combined;
    }),

  // Get recent transactions for an address
  getRecentTransactions: baseProcedure
    .input(
      z.object({
        address: z.string(),
        network: z.enum(['ethereum', 'optimism', 'base', 'ethereumSepolia']).default('ethereum'),
      })
    )
    .query(async ({ input: { address, network } }) => {
      const service = blockscoutServices[network];
      return service.getAddressTransactions(address);
    }),

  // Get combined recent activity across networks
  getCombinedRecentActivity: baseProcedure
    .input(
      z.object({
        address: z.string(),
        networks: z
          .array(z.enum(['ethereum', 'optimism', 'base', 'ethereumSepolia']))
          .default(['ethereum', 'base']),
      })
    )
    .query(async ({ input: { address, networks } }) => {
      const results = await Promise.allSettled(
        networks.map(async network => {
          const service = blockscoutServices[network];
          const transactions = await service.getAddressTransactions(address);
          return {
            network,
            transactions,
          };
        })
      );

      const combined = {
        allTransactions: [] as any[],
        networkData: {} as Record<string, any>,
        latestActivity: null as any,
      };

      results.forEach((result, index) => {
        const network = networks[index];
        if (result.status === 'fulfilled') {
          const { transactions } = result.value;
          combined.networkData[network] = {
            count: transactions.length,
            transactions: transactions.slice(0, 5), // Keep only first 5 for network data
          };
          combined.allTransactions.push(...transactions.map(tx => ({ ...tx, network })));
        } else {
          console.error(`Failed to fetch transactions for ${network}:`, result.reason);
          combined.networkData[network] = {
            error: result.reason?.message || 'Failed to fetch transactions',
          };
        }
      });

      // Sort all transactions by timestamp and get the latest
      combined.allTransactions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      combined.latestActivity = combined.allTransactions[0] || null;

      return combined;
    }),

  // Get token transfers for an address
  getAddressTokenTransfers: baseProcedure
    .input(
      z.object({
        address: z.string(),
        network: z.enum(['ethereum', 'optimism', 'base', 'ethereumSepolia']).default('ethereum'),
        type: z.string().optional(), // ERC-20, ERC-721, ERC-1155
        filter: z.string().optional(), // to | from
        token: z.string().optional(), // token address
      })
    )
    .query(async ({ input: { address, network, type, filter, token } }) => {
      const service = blockscoutServices[network];
      const filters = { type, filter, token };
      return service.getAddressTokenTransfers(address, filters);
    }),

  // Get combined token transfers across networks
  getCombinedTokenTransfers: baseProcedure
    .input(
      z.object({
        address: z.string(),
        networks: z
          .array(z.enum(['ethereum', 'optimism', 'base', 'ethereumSepolia']))
          .default(['ethereum', 'base']),
        type: z.string().optional(), // ERC-20, ERC-721, ERC-1155
        filter: z.string().optional(), // to | from
        token: z.string().optional(), // token address
      })
    )
    .query(async ({ input: { address, networks, type, filter, token } }) => {
      const results = await Promise.allSettled(
        networks.map(async network => {
          const service = blockscoutServices[network];
          const filters = { type, filter, token };
          const tokenTransfers = await service.getAddressTokenTransfers(address, filters);
          return {
            network,
            tokenTransfers,
          };
        })
      );

      const combined = {
        allTokenTransfers: [] as any[],
        networkData: {} as Record<string, any>,
        latestTokenTransfer: null as any,
      };

      results.forEach((result, index) => {
        const network = networks[index];
        if (result.status === 'fulfilled') {
          const { tokenTransfers } = result.value;
          combined.networkData[network] = {
            count: tokenTransfers.length,
            tokenTransfers: tokenTransfers.slice(0, 5), // Keep only first 5 for network data
          };
          combined.allTokenTransfers.push(...tokenTransfers.map(tt => ({ ...tt, network })));
        } else {
          console.error(`Failed to fetch token transfers for ${network}:`, result.reason);
          combined.networkData[network] = {
            error: result.reason?.message || 'Failed to fetch token transfers',
          };
        }
      });

      // Sort all token transfers by timestamp and get the latest
      combined.allTokenTransfers.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      combined.latestTokenTransfer = combined.allTokenTransfers[0] || null;

      return combined;
    }),
});
