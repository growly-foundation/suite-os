import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { buildTool, makeToolDescription } from '../../../../utils/tools';
import { getDocumentContentToolFn } from './core';

export function makeGetDocumentContentTool() {
  return new DynamicStructuredTool({
    name: 'get_document_content',
    description: makeToolDescription({
      description: `Get document content and metadata from attached document resources.`,
      condition:
        'Use when user asks about document content, file information, or when you need to reference information from attached documents.',
      input: {
        resourceId: {
          description: 'Resource ID of the document resource',
          required: true,
        },
      },
      output: [
        {
          type: 'text',
          description: 'Document metadata and content information.',
        },
      ],
    }),
    schema: z
      .object({
        resourceId: z.string().describe('Resource ID of the document resource'),
      })
      .strip()
      .describe('Input schema for document content access'),
    func: buildTool(getDocumentContentToolFn),
  });
}
