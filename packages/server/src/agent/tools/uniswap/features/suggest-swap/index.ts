import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { suggestSwap } from './core';
import { makeToolDescription } from 'src/agent/utils/tools';

export function makeSuggestSwapTool() {
  return new DynamicStructuredTool({
    name: 'suggest_swap',
    description: makeToolDescription({
      description: `Generates a pre-filled Uniswap swap link for exchanging one token for another.
Returns a detailed recommendation with reasoning and a direct swap link.`,
      input: {
        fromToken: {
          description: 'Symbol of the token to swap from (e.g., "ETH", "USDC")',
          required: true,
        },
        toToken: {
          description: 'Symbol of the token to swap to (e.g., "USDC", "ETH")',
          required: true,
        },
        amount: {
          description: 'Amount in USD to swap',
          required: true,
        },
        chain: {
          description: 'Blockchain to use for the swap',
          required: false,
        },
        reason: {
          description: 'Reason for suggesting this swap',
          required: false,
        },
      },
      output: {
        recommendation: {
          description: 'A swap recommendation with a pre-filled Uniswap link.',
        },
      },
    }),
    schema: z
      .object({
        fromToken: z.string().describe('The token symbol to swap from (e.g., "ETH", "USDC")'),
        toToken: z.string().describe('The token symbol to swap to (e.g., "USDC", "ETH")'),
        amount: z.number().describe('Amount in USD to swap'),
        chain: z
          .enum(['ethereum', 'base', 'optimism', 'arbitrum', 'polygon'] as const)
          .describe('Blockchain to use for the swap')
          .default('ethereum'),
        reason: z
          .string()
          .describe('Reason for suggesting this swap')
          .default('Custom token swap requested by user'),
      })
      .describe('Input schema for swap suggestions'),
    func: suggestSwap(),
  });
}
