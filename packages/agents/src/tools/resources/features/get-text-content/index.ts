import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { buildTool, makeToolDescription } from '../../../../utils/tools';
import { getTextContentToolFn } from './core';

export function makeGetTextContentTool() {
  return new DynamicStructuredTool({
    name: 'get_text_content',
    description: makeToolDescription({
      description: `Get full text content from attached text resources.`,
      condition:
        'Use when user asks about text content, notes, or when you need to reference information from attached text resources.',
      input: {
        resourceId: {
          description: 'Resource ID of the text resource',
          required: true,
        },
      },
      output: [
        {
          type: 'text',
          description: 'Full text content from the resource.',
        },
      ],
    }),
    schema: z
      .object({
        resourceId: z.string().describe('Resource ID of the text resource'),
      })
      .strip()
      .describe('Input schema for text content access'),
    func: buildTool(getTextContentToolFn),
  });
}
