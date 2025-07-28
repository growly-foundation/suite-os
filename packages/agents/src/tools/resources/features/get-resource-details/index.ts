import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { buildTool, makeToolDescription } from '../../../../utils/tools';
import { getResourceDetailsToolFn } from './core';

export function makeGetResourceDetailsTool() {
  return new DynamicStructuredTool({
    name: 'get_resource_details',
    description: makeToolDescription({
      description: `Get metadata and brief information about available resources attached to this agent.`,
      condition:
        'Use when user asks about available resources, knowledge base, or what information the agent can access.',
      input: {
        resourceId: {
          description:
            'Optional: Specific resource ID to get details for. If not provided, returns all resources.',
          required: false,
        },
      },
      output: [
        {
          type: 'text',
          description: 'Resource metadata including name, type, and brief description.',
        },
      ],
    }),
    schema: z
      .object({
        resourceId: z
          .string()
          .describe('Optional: Specific resource ID to get details for')
          .optional(),
      })
      .strip()
      .describe('Input schema for getting resource details'),
    func: buildTool(getResourceDetailsToolFn),
  });
}

// Re-export context management functions
export { getResourceContext, setResourceContext } from './core';
export type { ResourceContext } from './core';
