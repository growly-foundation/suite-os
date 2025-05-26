import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ConfigService } from '@nestjs/config';
import { makeToolDescription } from '../../../../utils/tools';
import { buildTool } from '../../../../utils/tools';
import { getFungiblesPositionsToolFn } from './core';

export function makeGetFungiblePositionsTool(configService: ConfigService) {
  return new DynamicStructuredTool({
    name: 'get_fungible_positions',
    description: makeToolDescription({
      description: `
      Fetches and summarizes a crypto wallet's token holdings in USD. 
      It also includes DeFi positions if the user has any.
      Returns a summary of top tokens and their values.`,
      input: {
        walletAddress: {
          description: 'Wallet address to fetch data for',
          required: true,
        },
      },
      output: [
        {
          type: 'text',
          description: 'Text summary of token holdings.',
        },
      ],
    }),
    schema: z
      .object({
        walletAddress: z
          .string()
          .describe(
            'The wallet address to fetch fungible positions for (defaults to connected wallet if not provided)'
          ),
      })
      .strip()
      .describe('Input schema for fetching wallet fungible positions'),
    func: buildTool(getFungiblesPositionsToolFn, configService),
  });
}
