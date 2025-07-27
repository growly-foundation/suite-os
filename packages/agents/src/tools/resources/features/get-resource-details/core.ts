import { ResourceType } from '@getgrowly/core';

import { ToolFn, ToolOutputValue } from '../../../../utils/tools';

export interface ResourceContext {
  id: string;
  name: string;
  type: ResourceType;
  value: any;
}

export interface ResourceToolContext {
  resources: ResourceContext[];
}

// Use a more robust context management system
const resourceContextMap = new Map<string, ResourceContext[]>();

export function setResourceContext(resources: ResourceContext[], contextId = 'default') {
  resourceContextMap.set(contextId, resources);
  // Also set global for backward compatibility
  (global as any).__resourceContext = resources;
}

export function getResourceContext(contextId = 'default'): ResourceContext[] {
  // Try to get from map first, then fall back to global
  return resourceContextMap.get(contextId) || (global as any).__resourceContext || [];
}

export const getResourceDetailsToolFn: ToolFn =
  () =>
  async ({ resourceId }: { resourceId?: string }): Promise<ToolOutputValue[]> => {
    const resources = getResourceContext();

    if (resourceId) {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) {
        return [
          {
            type: 'text',
            content: `Resource with ID "${resourceId}" not found.`,
          },
        ];
      }

      let description = '';
      switch (resource.type) {
        case 'link': {
          const url = resource.value?.url;
          description = url ? `Website resource: ${url}` : 'Website resource';
          if (resource.value?.description) {
            description += ` - ${resource.value.description}`;
          }
          break;
        }
        case 'contract': {
          const address = resource.value?.address;
          const network = resource.value?.network;
          description = address
            ? `Smart contract: ${address}${network ? ` on chain ${network}` : ''}`
            : 'Smart contract';
          if (resource.value?.abi) {
            const functionCount = resource.value.abi.filter(
              (item: any) => item.type === 'function'
            ).length;
            description += ` (${functionCount} functions available)`;
          }
          break;
        }
        case 'document': {
          const docType = resource.value?.documentType;
          const docSize = resource.value?.documentSize;
          const docName = resource.value?.documentName;
          description = docName ? `Document: ${docName}` : 'Document';
          if (docType) {
            description += ` (${docType.toUpperCase()})`;
          }
          if (docSize) {
            description += ` - ${Math.round(docSize / 1024)} KB`;
          }
          break;
        }
        case 'text': {
          const content = resource.value?.content;
          if (content) {
            const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
            description = `Text resource: ${preview}`;
          } else {
            description = 'Text resource';
          }
          break;
        }
        default:
          description = 'Unknown resource type';
      }

      return [
        {
          type: 'text',
          content: `**Resource Details**\n- Name: ${resource.name}\n- Type: ${resource.type}\n- Description: ${description}`,
        },
      ];
    }

    // Return all resources
    if (resources.length === 0) {
      return [
        {
          type: 'text',
          content: 'No resources are currently attached to this agent.',
        },
      ];
    }

    const resourceList = resources
      .map(
        (resource, index) =>
          `${index + 1}. **${resource.name}** (${resource.type})\n   - ID: ${resource.id}\n   - Use resource tools to access content`
      )
      .join('\n\n');

    return [
      {
        type: 'text',
        content: `**Available Resources (${resources.length})**\n\n${resourceList}\n\n**Available Tools:**\n- \`get_website_content\` for website resources\n- \`get_contract_abi\` for contract resources\n- \`get_document_content\` for document resources\n- \`get_text_content\` for text resources`,
      },
    ];
  };
