import { ToolFn, ToolOutputValue } from '../../../../utils/tools';
import { getResourceContext } from '../get-resource-details/core';

export interface FirecrawlService {
  scrapeUrl(url: string, options?: any): Promise<any>;
}

let firecrawlService: FirecrawlService | null = null;

export function setFirecrawlService(service: FirecrawlService) {
  firecrawlService = service;
}

export const getWebsiteContentToolFn: ToolFn =
  () =>
  async ({
    resourceId,
    includeLinks,
  }: {
    resourceId: string;
    includeLinks?: boolean;
  }): Promise<ToolOutputValue[]> => {
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

    if (resource.type !== 'link') {
      return [
        {
          type: 'text',
          content: `Resource "${resource.name}" is not a website resource (type: ${resource.type}). Use the appropriate tool for this resource type.`,
        },
      ];
    }

    const url = resource.value.url;
    if (!url) {
      return [
        {
          type: 'text',
          content: `Website resource "${resource.name}" does not have a valid URL.`,
        },
      ];
    }

    if (!firecrawlService) {
      return [
        {
          type: 'text',
          content: `Firecrawl service is not available. Cannot extract content from: ${url}\n\nPlease ensure the FIRECRAWL_API_KEY environment variable is configured.`,
        },
      ];
    }

    try {
      const scrapeOptions = {
        formats: ['markdown'],
        onlyMainContent: true,
        includeTags: includeLinks ? ['a'] : [],
        maxAge: 3600, // Cache for 1 hour
      };

      const result = await firecrawlService.scrapeUrl(url, scrapeOptions);

      if (!result || !result.data) {
        return [
          {
            type: 'text',
            content: `Failed to extract content from ${url}. The website might be inaccessible, blocked, or require authentication.`,
          },
        ];
      }

      const content = result.data.markdown || result.data.content || 'No content extracted';

      // Truncate very long content to avoid token limits
      const maxLength = 8000;
      const truncatedContent =
        content.length > maxLength
          ? content.substring(0, maxLength) + '\n\n... (content truncated for brevity)'
          : content;

      return [
        {
          type: 'text',
          content: `**Website Content: ${resource.name}**\n\n**Source:** ${url}\n\n**Content:**\n${truncatedContent}`,
        },
      ];
    } catch (error: any) {
      return [
        {
          type: 'text',
          content: `Failed to extract content from ${url}: ${error.message}\n\nThis could be due to:\n- Network connectivity issues\n- Website blocking automated access\n- Rate limiting\n- Invalid URL format`,
        },
      ];
    }
  };
