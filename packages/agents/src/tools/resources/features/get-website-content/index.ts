import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { buildTool, makeToolDescription } from '../../../../utils/tools';
import { getWebsiteContentToolFn } from './core';

export function makeGetWebsiteContentTool() {
  return new DynamicStructuredTool({
    name: 'get_website_content',
    description: makeToolDescription({
      description: `Extract and analyze content from website resources using Firecrawl.`,
      condition:
        'Use when user asks about website content, documentation, or when you need to reference information from attached website resources.',
      input: {
        resourceId: {
          description: 'Resource ID of the website resource to extract content from',
          required: true,
        },
        includeLinks: {
          description: 'Whether to include links in the extracted content',
          required: false,
        },
      },
      output: [
        {
          type: 'text',
          description: 'Extracted website content in markdown format.',
        },
      ],
    }),
    schema: z
      .object({
        resourceId: z.string().describe('Resource ID of the website resource'),
        includeLinks: z
          .boolean()
          .describe('Whether to include links in the extracted content')
          .default(false),
      })
      .strip()
      .describe('Input schema for website content extraction'),
    func: buildTool(getWebsiteContentToolFn),
  });
}
