import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { buildTool, makeToolDescription } from '../../../../utils/tools';
import { getContractAbiToolFn } from './core';

export function makeGetContractAbiTool() {
  return new DynamicStructuredTool({
    name: 'get_contract_abi',
    description: makeToolDescription({
      description: `Get detailed information about a smart contract's ABI with comprehensive analysis including complexity metrics, security patterns, and function categorization.`,
      condition:
        'Use when user asks about smart contract functions, ABI, security analysis, or when you need to understand contract capabilities.',
      input: {
        resourceId: {
          description: 'Resource ID of the contract resource',
          required: true,
        },
        functionName: {
          description: 'Optional: Specific function name to get details for',
          required: false,
        },
        includeMetrics: {
          description:
            'Optional: Whether to include complexity and security analysis (default: true)',
          required: false,
        },
      },
      output: [
        {
          type: 'text',
          description: 'Comprehensive contract analysis with ABI details, metrics, and insights.',
        },
      ],
    }),
    schema: z
      .object({
        resourceId: z.string().describe('Resource ID of the contract resource'),
        functionName: z
          .string()
          .describe('Optional: Specific function name to get details for')
          .optional(),
        includeMetrics: z
          .boolean()
          .describe('Optional: Whether to include complexity and security analysis')
          .default(true)
          .optional(),
      })
      .strip()
      .describe('Input schema for contract ABI analysis'),
    func: buildTool(getContractAbiToolFn),
  });
}
