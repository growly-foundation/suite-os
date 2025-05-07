import { DynamicStructuredTool } from '@langchain/core/tools';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { isAddress } from 'viem';
import { z } from 'zod';
import { ZERION_V1_BASE_URL } from './constants';
import {
  ZerionFungiblePositionsResponse,
  ZerionPortfolioResponse,
} from './types';
import { formatPortfolioData, formatPositionsData } from './utils';

const axiosInstance = axios.create({
  baseURL: ZERION_V1_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Factory function to get encoded key using ConfigService
export function getEncodedKey(configService: ConfigService): string {
  const apiKey = configService.get<string>('ZERION_API_KEY');
  if (!apiKey) {
    throw new Error('ZERION_API_KEY is not configured.');
  }
  return Buffer.from(`${apiKey}:`).toString('base64');
}

export function makeZerionTools(configService: ConfigService) {
  const encodedKey = getEncodedKey(configService);

  const getPortfolioOverviewTool = new DynamicStructuredTool({
    name: 'get_portfolio_overview',
    description: `
Fetches and summarizes a crypto wallet's portfolio in USD. 
Returns total value, 24h performance, value by position type, and top 5 chains by value.

Input:
- walletAddress: Wallet address to fetch data for.

Output:
- Text summary of portfolio data.
`,
    schema: z
      .object({
        walletAddress: z
          .string()
          .describe(
            'The wallet address to fetch portfolio for (defaults to connected wallet if not provided)',
          ),
      })
      .strip()
      .describe('Input schema for fetching wallet portfolio'),
    func: async ({ walletAddress }) => {
      if (!isAddress(walletAddress)) {
        return `Invalid wallet address: ${walletAddress}`;
      }
      try {
        const response = await axiosInstance.get<ZerionPortfolioResponse>(
          `/wallets/${walletAddress}/portfolio?filter[positions]=no_filter&currency=usd`,
          {
            headers: {
              Authorization: `Basic ${encodedKey}`,
            },
          },
        );
        const { data } = response.data;
        return formatPortfolioData(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          return `Failed to fetch portfolio: ${error.message}`;
        }
        return 'Failed to fetch portfolio data.';
      }
    },
  });

  const getFungiblePositionsTool = new DynamicStructuredTool({
    name: 'get_fungible_positions',
    description: `
Fetches and summarizes a crypto wallet's fungible token holdings in USD. 
Returns a summary of top tokens and their values.

Input:
- walletAddress: Wallet address to fetch data for.

Output:
- Text summary of token holdings.
`,
    schema: z
      .object({
        walletAddress: z
          .string()
          .describe(
            'The wallet address to fetch fungible positions for (defaults to connected wallet if not provided)',
          ),
      })
      .strip()
      .describe('Input schema for fetching wallet fungible positions'),
    func: async ({ walletAddress }) => {
      if (!isAddress(walletAddress)) {
        return `Invalid wallet address: ${walletAddress}`;
      }
      try {
        const response =
          await axiosInstance.get<ZerionFungiblePositionsResponse>(
            `/wallets/${walletAddress}/positions?filter[positions]=no_filter&currency=usd&filter[trash]=only_non_trash&sort=value`,
            {
              headers: {
                Authorization: `Basic ${encodedKey}`,
              },
            },
          );
        const { data } = response.data;
        return formatPositionsData(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          return `Failed to fetch token holdings data: ${error.message}`;
        }
        return 'Failed to fetch token holdings data.';
      }
    },
  });

  return { getPortfolioOverviewTool, getFungiblePositionsTool };
}
