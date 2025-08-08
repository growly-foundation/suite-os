import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { buildTool, makeToolDescription } from '../../../../utils/tools';
import { getWebsiteContentToolFn } from './core';

export function makeGetWebsiteContentTool() {
  return new DynamicStructuredTool({
    name: 'get_website_content',
    description: makeToolDescription({
      description: `Extract and analyze website content with intelligent content type detection, key insights, and structural analysis.`,
      condition:
        'Use when user asks about website content, wants to analyze web pages, or needs to understand what information is available on a website.',
      input: {
        resourceId: {
          description: 'Resource ID of the website resource',
          required: true,
        },
        includeLinks: {
          description: 'Optional: Whether to include links from the webpage (default: false)',
          required: false,
        },
        includeAnalysis: {
          description: 'Optional: Whether to include content analysis and insights (default: true)',
          required: false,
        },
        maxLength: {
          description: 'Optional: Maximum content length in characters (default: 8000)',
          required: false,
        },
      },
      output: [
        {
          type: 'text',
          description:
            'Website content with analysis including content type, insights, structure, and full text.',
        },
      ],
    }),
    schema: z
      .object({
        resourceId: z.string().describe('Resource ID of the website resource'),
        includeLinks: z
          .boolean()
          .describe('Optional: Whether to include links from the webpage')
          .default(false)
          .optional(),
        includeAnalysis: z
          .boolean()
          .describe('Optional: Whether to include content analysis and insights')
          .default(true)
          .optional(),
        maxLength: z
          .number()
          .describe('Optional: Maximum content length in characters')
          .default(15000)
          .optional(),
      })
      .strip()
      .describe('Input schema for website content extraction'),
    func: buildTool(getWebsiteContentToolFn),
  });
}
