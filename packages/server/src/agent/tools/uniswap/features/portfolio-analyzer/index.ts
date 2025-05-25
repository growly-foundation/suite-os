import { DynamicStructuredTool } from '@langchain/core/tools';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { analyzePortfolioToolFn } from './core';
import { makeToolDescription } from '../../../../utils/tools';

export function makePortfolioAnalyzerTool(configService: ConfigService) {
  return new DynamicStructuredTool({
    name: 'analyze_portfolio',
    description: makeToolDescription({
      description: `Performs a detailed analysis of a crypto portfolio and provides personalized rebalancing suggestions.
Provides in-depth reasoning and analytics about the current portfolio structure and recommended changes.`,
      condition:
        'Triggers when users ask about their portfolio balance, risk assessment, or detailed analysis.',
      input: {
        walletAddress: {
          description: 'Wallet address to analyze',
          required: true,
        },
        strategy: {
          description:
            'Rebalancing strategy preference ("conservative", "moderate", or "aggressive")',
          required: false,
        },
      },
      output: [
        {
          type: 'text',
          description: 'A detailed portfolio analysis with personalized rebalancing suggestions',
        },
      ],
    }),
    schema: z
      .object({
        walletAddress: z.string().describe('The wallet address to analyze'),
        strategy: z
          .enum(['conservative', 'moderate', 'aggressive'] as const)
          .describe('The rebalancing strategy preference')
          .default('moderate'),
      })
      .describe('Input schema for portfolio analysis'),
    func: analyzePortfolioToolFn(configService),
  });
}
