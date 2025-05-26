import { DynamicStructuredTool } from '@langchain/core/tools';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { makeToolDescription } from '../../../../utils/tools';
import { getPortfolioOverviewToolFn } from './core';
import { buildTool } from '../../../../utils/tools';

export function makePortfolioOverviewTool(configService: ConfigService) {
  return new DynamicStructuredTool({
    name: 'get_portfolio_overview',
    description: makeToolDescription({
      description: `Fetches and summarizes a crypto wallet's portfolio in USD. 
Returns total value, 24h performance, value by position type, and top 5 chains by value.`,
      input: {
        walletAddress: {
          description: 'Wallet address to fetch data for',
          required: true,
        },
      },
      output: [
        {
          type: 'text',
          description: 'Text summary of portfolio data.',
        },
      ],
    }),
    schema: z
      .object({
        walletAddress: z
          .string()
          .describe(
            'The wallet address to fetch portfolio for (defaults to connected wallet if not provided)'
          ),
      })
      .strip()
      .describe('Input schema for fetching wallet portfolio'),
    func: buildTool(getPortfolioOverviewToolFn, configService),
  });
}
