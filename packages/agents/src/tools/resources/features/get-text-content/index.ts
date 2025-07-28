import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { buildTool, makeToolDescription } from '../../../../utils/tools';
import { getTextContentToolFn } from './core';

export function makeGetTextContentTool() {
  return new DynamicStructuredTool({
    name: 'get_text_content',
    description: makeToolDescription({
      description: `Access and analyze text content with intelligent analysis including content type detection, sentiment analysis, key topic extraction, and structural insights.`,
      condition:
        'Use when user asks about text content, wants to analyze written material, or needs to understand the content and structure of text resources.',
      input: {
        resourceId: {
          description: 'Resource ID of the text resource',
          required: true,
        },
        includeAnalysis: {
          description: 'Optional: Whether to include content analysis and insights (default: true)',
          required: false,
        },
        maxLength: {
          description: 'Optional: Maximum content length in characters (default: 10000)',
          required: false,
        },
      },
      output: [
        {
          type: 'text',
          description:
            'Text content with analysis including content type, sentiment, structure, topics, and full text.',
        },
      ],
    }),
    schema: z
      .object({
        resourceId: z.string().describe('Resource ID of the text resource'),
        includeAnalysis: z
          .boolean()
          .describe('Optional: Whether to include content analysis and insights')
          .default(true)
          .optional(),
        maxLength: z
          .number()
          .describe('Optional: Maximum content length in characters')
          .default(10000)
          .optional(),
      })
      .strip()
      .describe('Input schema for text content access'),
    func: buildTool(getTextContentToolFn),
  });
}
