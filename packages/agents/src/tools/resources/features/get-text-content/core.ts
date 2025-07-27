import { ToolFn, ToolOutputValue } from '../../../../utils/tools';
import { getResourceContext } from '../get-resource-details/core';

export const getTextContentToolFn: ToolFn =
  () =>
  async ({ resourceId }: { resourceId: string }): Promise<ToolOutputValue[]> => {
    const resources = getResourceContext();

    if (resources.length === 0) {
      return [
        {
          type: 'text',
          content:
            'No resources are currently available. Please ensure resources are properly attached to this agent.',
        },
      ];
    }

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      const availableIds = resources.map(r => `${r.name} (${r.id})`).join(', ');
      return [
        {
          type: 'text',
          content: `Resource with ID "${resourceId}" not found. Available resources: ${availableIds}`,
        },
      ];
    }

    if (resource.type !== 'text') {
      return [
        {
          type: 'text',
          content: `Resource "${resource.name}" is not a text resource (type: ${resource.type}). Use the appropriate tool for this resource type.`,
        },
      ];
    }

    const textValue = resource.value;
    const content = textValue.content;
    const format = textValue.format || 'plain';

    if (!content) {
      return [
        {
          type: 'text',
          content: `Text resource "${resource.name}" does not have any content.`,
        },
      ];
    }

    const formatLabel = format === 'markdown' ? 'Markdown' : 'Plain Text';

    return [
      {
        type: 'text',
        content: `**Text Resource: ${resource.name}**\n\n**Format:** ${formatLabel}\n\n**Content:**\n${content}`,
      },
    ];
  };
