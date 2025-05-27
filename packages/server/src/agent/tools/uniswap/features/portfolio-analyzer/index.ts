import { DynamicStructuredTool } from '@langchain/core/tools';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { analyzePortfolioToolFn } from './core';
import { buildTool, makeToolDescription } from '../../../../utils/tools';

export function makePortfolioAnalyzerTool(configService: ConfigService) {
  return new DynamicStructuredTool({
    name: 'analyze_portfolio',
    description: makeToolDescription({
      description: `Analyze a crypto portfolio and suggest personalized rebalancing. Include detailed insights on structure, risk, and performance, with clear reasoning behind recommended changes.`,
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
    func: buildTool(analyzePortfolioToolFn, configService),
  });
}
