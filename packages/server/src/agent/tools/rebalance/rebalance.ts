import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ZerionFungiblePosition } from '../zerion/types';
import { isAddress } from 'viem';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ZERION_V1_BASE_URL } from '../zerion/constants';
import { getEncodedKey } from '../zerion/zerion';

/**
 * Tool that fetches detailed portfolio data to enable AI evaluation
 * 
 * This tool doesn't make rebalancing decisions but provides formatted portfolio
 * data that the LLM can analyze to make its own rebalancing recommendations.
 */
export function makePortfolioAnalysisTool(configService: ConfigService) {
  const encodedKey = getEncodedKey(configService);
  const axiosInstance = axios.create({
    baseURL: ZERION_V1_BASE_URL,
    headers: {
      Accept: 'application/json',
    },
  });

  return new DynamicStructuredTool({
    name: 'analyze_portfolio_data',
    description: `
Fetches and analyzes detailed portfolio data for a crypto wallet.
Provides token allocations, price changes, and other metrics to help
evaluate whether rebalancing is needed.

Input:
- walletAddress: Wallet address to analyze.

Output:
- Structured portfolio data for analysis.
`,
    schema: z
      .object({
        walletAddress: z
          .string()
          .describe('The wallet address to analyze'),
      })
      .strip()
      .describe('Input schema for portfolio analysis'),
    func: async ({ walletAddress }) => {
      if (!isAddress(walletAddress)) {
        return JSON.stringify({ error: `Invalid wallet address: ${walletAddress}` });
      }

      try {
        // Fetch portfolio positions
        const response = await axiosInstance.get(
          `/wallets/${walletAddress}/positions?filter[positions]=no_filter&currency=usd&filter[trash]=only_non_trash&sort=value`,
          {
            headers: {
              Authorization: `Basic ${encodedKey}`,
            },
          }
        );

        const positions = response.data.data;
        
        // Filter for relevant positions (wallet and staked positions with value > $1)
        const relevantPositions = positions.filter(
          (pos: ZerionFungiblePosition) => 
            pos.attributes.value !== null && 
            pos.attributes.value > 1 &&
            (pos.attributes.position_type === 'wallet' || pos.attributes.position_type === 'staked')
        );

        // If there are fewer than 2 tokens, no rebalancing needed
        if (relevantPositions.length < 2) {
          return JSON.stringify({
            canRebalance: false,
            reason: "Not enough tokens in wallet for rebalancing consideration",
            positions: relevantPositions.length
          });
        }

        // Sort by value (descending)
        const sortedPositions = relevantPositions.sort(
          (a, b) => b.attributes.value! - a.attributes.value!
        );

        // Calculate total portfolio value for relevant positions
        const totalValue = sortedPositions.reduce(
          (sum, pos) => sum + pos.attributes.value!,
          0
        );

        // Build details for each token position including allocation percentage
        const positionDetails = sortedPositions.map(pos => {
          const percentOfPortfolio = (pos.attributes.value! / totalValue) * 100;
          const impl = pos.attributes.fungible_info.implementations[0];
          
          return {
            symbol: pos.attributes.fungible_info.symbol,
            name: pos.attributes.fungible_info.name,
            type: pos.attributes.position_type,
            chain: pos.relationships.chain.data.id,
            value: pos.attributes.value,
            price: pos.attributes.price,
            percentOfPortfolio,
            priceChange24h: pos.attributes.changes?.percent_1d || 0,
            decimals: impl?.decimals || 18,
            verified: pos.attributes.fungible_info.flags.verified,
            protocol: pos.attributes.protocol
          };
        });

        // Include portfolio metrics
        return JSON.stringify({
          canRebalance: true,
          totalValue,
          positionCount: positionDetails.length,
          positions: positionDetails,
          // Include some metrics that might help the LLM make decisions
          metrics: {
            // Concentration measure - how much is in top holdings
            topHoldingPercent: positionDetails[0].percentOfPortfolio,
            top3HoldingsPercent: positionDetails.slice(0, 3).reduce(
              (sum, pos) => sum + pos.percentOfPortfolio, 0
            ),
            // Simple diversity measure
            diversityScore: Math.min(10, positionDetails.length) / 10,
            // Volatility indicator (based on 24h changes)
            volatilityIndicator: positionDetails
              .filter(p => p.percentOfPortfolio > 5) // Only consider significant positions
              .reduce((sum, pos) => sum + Math.abs(pos.priceChange24h), 0) / 
              positionDetails.filter(p => p.percentOfPortfolio > 5).length
          }
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          return JSON.stringify({ 
            error: `Failed to analyze portfolio: ${error.message}`,
            canRebalance: false
          });
        }
        return JSON.stringify({ 
          error: 'Failed to analyze portfolio due to unknown error',
          canRebalance: false
        });
      }
    },
  });
}
