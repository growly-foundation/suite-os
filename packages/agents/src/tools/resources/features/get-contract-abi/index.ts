import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { buildTool, makeToolDescription } from '../../../../utils/tools';
import { getContractAbiToolFn } from './core';

export function makeGetContractAbiTool() {
  return new DynamicStructuredTool({
    name: 'get_contract_abi',
    description: makeToolDescription({
      description: `Get smart contract ABI and details from attached contract resources.`,
      condition:
        'Use when user asks about smart contract functions, ABI, or when you need to understand contract capabilities.',
      input: {
        resourceId: {
          description: 'Resource ID of the contract resource',
          required: true,
        },
        functionName: {
          description: 'Optional: Specific function name to get details for',
          required: false,
        },
      },
      output: [
        {
          type: 'text',
          description: 'Contract ABI and function details.',
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
      })
      .strip()
      .describe('Input schema for contract ABI access'),
    func: buildTool(getContractAbiToolFn),
  });
}
