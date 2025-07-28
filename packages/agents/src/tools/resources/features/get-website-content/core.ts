import { ToolOutputValue } from '../../../../utils/tools';
import { getResourceContext } from '../get-resource-details/core';

// Firecrawl service interface
interface FirecrawlService {
  scrapeUrl(url: string, options?: any): Promise<any>;
}

let firecrawlService: FirecrawlService | null = null;

export const setFirecrawlService = (service: FirecrawlService) => {
  firecrawlService = service;
};

// Content analysis functions
const analyzeContentType = (
  content: string,
  url: string
): {
  type: string;
  confidence: number;
  indicators: string[];
} => {
  const indicators: string[] = [];
  let type = 'General Website';
  let confidence = 0.5;

  // Blog/Article detection
  if (
    content.match(/\b(posted|published|author|by\s+\w+|blog|article)\b/gi) ||
    content.match(/\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2},\s+\d{4}/g)
  ) {
    type = 'Blog/Article';
    confidence = 0.8;
    indicators.push('Date patterns', 'Author mentions', 'Publishing keywords');
  }

  // Documentation detection
  if (
    content.match(
      /\b(api|documentation|docs|reference|guide|tutorial|getting started|installation)\b/gi
    ) ||
    content.includes('```') ||
    content.match(/\bfunction\s+\w+\(|\bclass\s+\w+/g)
  ) {
    type = 'Documentation';
    confidence = 0.9;
    indicators.push('Technical terminology', 'Code blocks', 'API references');
  }

  // E-commerce detection
  if (
    content.match(/\b(\$\d+|\d+\.\d{2}|price|buy|cart|checkout|product|shop|store)\b/gi) ||
    content.match(/\b(add to cart|buy now|purchase|order)\b/gi)
  ) {
    type = 'E-commerce';
    confidence = 0.85;
    indicators.push('Pricing information', 'Shopping keywords', 'Product listings');
  }

  // News detection
  if (
    content.match(/\b(breaking|news|report|journalist|correspondent|reuters|ap news)\b/gi) ||
    url.includes('news') ||
    content.match(/\d{1,2}:\d{2}\s+(AM|PM)/gi)
  ) {
    type = 'News';
    confidence = 0.8;
    indicators.push('News terminology', 'Timestamps', 'Journalist bylines');
  }

  // Landing page detection
  if (
    content.match(/\b(sign up|get started|free trial|contact us|learn more|subscribe)\b/gi) &&
    content.length < 3000
  ) {
    type = 'Landing Page';
    confidence = 0.7;
    indicators.push('Call-to-action buttons', 'Marketing language', 'Concise content');
  }

  // Social media detection
  if (
    content.match(/\b(followers|likes|shares|retweets|posts|@\w+|#\w+)\b/gi) ||
    url.match(/twitter|facebook|instagram|linkedin|tiktok/i)
  ) {
    type = 'Social Media';
    confidence = 0.9;
    indicators.push('Social metrics', 'Hashtags', 'Social platform URLs');
  }

  return { type, confidence, indicators };
};

const extractKeyInsights = (content: string, contentType: string): string[] => {
  const insights: string[] = [];
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  insights.push(`Reading time: ~${readingTime} minutes (${wordCount} words)`);

  // Extract key topics using simple keyword frequency
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(
      word =>
        word.length > 4 &&
        ![
          'the',
          'and',
          'for',
          'are',
          'but',
          'not',
          'you',
          'all',
          'can',
          'had',
          'her',
          'was',
          'one',
          'our',
          'out',
          'day',
          'get',
          'has',
          'him',
          'his',
          'how',
          'its',
          'may',
          'new',
          'now',
          'old',
          'see',
          'two',
          'who',
          'boy',
          'did',
          'she',
          'use',
          'her',
          'way',
          'many',
          'then',
          'them',
          'well',
          'were',
        ].includes(word)
    );

  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const topWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  if (topWords.length > 0) {
    insights.push(`Key topics: ${topWords.join(', ')}`);
  }

  // Content-specific insights
  switch (contentType) {
    case 'Blog/Article': {
      const headings = content.match(/^#+\s+.+$/gm) || [];
      if (headings.length > 0) {
        insights.push(`Article structure: ${headings.length} sections`);
      }
      break;
    }
    case 'Documentation': {
      const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
      const apiEndpoints = content.match(/\b(GET|POST|PUT|DELETE)\s+\//g) || [];
      if (codeBlocks.length > 0) {
        insights.push(`Contains ${codeBlocks.length} code examples`);
      }
      if (apiEndpoints.length > 0) {
        insights.push(`Documents ${apiEndpoints.length} API endpoints`);
      }
      break;
    }
    case 'E-commerce': {
      const prices = content.match(/\$\d+(?:\.\d{2})?/g) || [];
      if (prices.length > 0) {
        insights.push(`Found ${prices.length} price points`);
      }
      break;
    }
    case 'News': {
      const quotes = content.match(/"[^"]{20,}"/g) || [];
      if (quotes.length > 0) {
        insights.push(`Contains ${quotes.length} quoted statements`);
      }
      break;
    }
  }

  return insights;
};

const analyzeContentStructure = (
  content: string
): {
  headings: number;
  lists: number;
  links: number;
  images: number;
  tables: number;
} => {
  return {
    headings: (content.match(/^#+\s+.+$/gm) || []).length,
    lists:
      (content.match(/^\s*[-*+]\s+/gm) || []).length +
      (content.match(/^\s*\d+\.\s+/gm) || []).length,
    links: (content.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length,
    images: (content.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length,
    tables: (content.match(/\|.*\|/g) || []).length / 2, // Rough estimate
  };
};

const generateContentSummary = (content: string, maxLength = 300): string => {
  // Remove markdown formatting for cleaner summary
  const cleanContent = content
    .replace(/#+\s+/g, '') // Remove heading markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .replace(/`([^`]+)`/g, '$1') // Remove code formatting
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete sentence within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');

  if (lastSentence > maxLength * 0.7) {
    return truncated.substring(0, lastSentence + 1);
  }

  return truncated + '...';
};

export const getWebsiteContentToolFn =
  () =>
  async (args: {
    resourceId: string;
    includeLinks?: boolean;
    includeAnalysis?: boolean;
    maxLength?: number;
  }): Promise<ToolOutputValue[]> => {
    const { resourceId, includeLinks = false, includeAnalysis = true, maxLength = 8000 } = args;

    const resources = getResourceContext();
    if (!resources || resources.length === 0) {
      return [
        {
          type: 'system:error',
          content: 'No resources available. Please ensure resources are properly configured.',
        },
      ];
    }

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      const availableIds = resources.map(r => r.id).join(', ');
      return [
        {
          type: 'system:error',
          content: `Resource with ID "${resourceId}" not found. Available resources: ${availableIds}`,
        },
      ];
    }

    if (resource.type !== 'link') {
      return [
        {
          type: 'system:error',
          content: `Resource "${resourceId}" is not a website resource. Use get_contract_abi for contracts, get_document_content for documents, or get_text_content for text.`,
        },
      ];
    }

    const linkValue = resource.value;
    if (!linkValue?.url) {
      return [
        {
          type: 'system:error',
          content: `Website resource "${resourceId}" is missing URL information.`,
        },
      ];
    }

    if (!firecrawlService) {
      return [
        {
          type: 'system:error',
          content:
            'Firecrawl service is not available. Website content extraction is currently disabled.',
        },
      ];
    }

    try {
      // Build formats array based on what we want to extract
      const formats = ['markdown'];
      if (includeLinks) {
        formats.push('links');
      }

      const scrapeOptions = {
        formats,
        onlyMainContent: true,
        maxAge: 3600, // 1 hour cache
      };

      const scrapeResult = await firecrawlService.scrapeUrl(linkValue.url, scrapeOptions);

      // Handle both old and new response formats
      let content: string;
      let metadata: any = {};
      let success = false;

      if (scrapeResult.success !== undefined) {
        // New API format
        success = scrapeResult.success;
        content = scrapeResult.markdown || scrapeResult.data?.markdown || '';
        metadata = scrapeResult.metadata || scrapeResult.data?.metadata || {};
      } else if (scrapeResult.data) {
        // Old API format
        success = true;
        content = scrapeResult.data.markdown || scrapeResult.data.content || '';
        metadata = scrapeResult.data.metadata || {};
      } else {
        success = false;
        content = '';
      }

      if (!success || !content) {
        return [
          {
            type: 'text',
            content: `**Website Content Extraction Failed**

**URL:** ${linkValue.url}
**Status:** Unable to extract content

**Possible reasons:**
- Website blocks automated access (403 Forbidden)
- Content requires JavaScript to load
- Network timeout or connectivity issues
- Rate limiting by the website
- Website is temporarily unavailable (404/500 errors)

**Suggestion:** Try accessing the website manually or check if it's publicly accessible.`,
          },
        ];
      }

      const originalLength = content.length;

      // Truncate content if too long
      if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '\n\n... (content truncated)';
      }

      let response = `**Website Content Analysis**\n\n`;
      response += `**URL:** ${linkValue.url}\n`;
      if (metadata.title) {
        response += `**Title:** ${metadata.title}\n`;
      }
      if (metadata.description) {
        response += `**Description:** ${metadata.description}\n`;
      }
      response += `**Content Length:** ${originalLength.toLocaleString()} characters\n`;
      if (originalLength > maxLength) {
        response += `**Note:** Content truncated to ${maxLength.toLocaleString()} characters\n`;
      }
      response += `\n`;

      if (includeAnalysis) {
        // Content type analysis
        const contentAnalysis = analyzeContentType(content, linkValue.url);
        response += `**Content Analysis:**\n`;
        response += `- **Type:** ${contentAnalysis.type} (${Math.round(contentAnalysis.confidence * 100)}% confidence)\n`;
        if (contentAnalysis.indicators.length > 0) {
          response += `- **Indicators:** ${contentAnalysis.indicators.join(', ')}\n`;
        }
        response += `\n`;

        // Key insights
        const insights = extractKeyInsights(content, contentAnalysis.type);
        if (insights.length > 0) {
          response += `**Key Insights:**\n`;
          insights.forEach(insight => {
            response += `- ${insight}\n`;
          });
          response += `\n`;
        }

        // Content structure
        const structure = analyzeContentStructure(content);
        response += `**Content Structure:**\n`;
        response += `- **Headings:** ${structure.headings}\n`;
        response += `- **Lists:** ${structure.lists}\n`;
        response += `- **Links:** ${structure.links}\n`;
        response += `- **Images:** ${structure.images}\n`;
        if (structure.tables > 0) {
          response += `- **Tables:** ${Math.round(structure.tables)}\n`;
        }
        response += `\n`;

        // Content summary
        const summary = generateContentSummary(content);
        response += `**Content Summary:**\n${summary}\n\n`;
      }

      response += `**Full Content:**\n\n${content}`;

      return [
        {
          type: 'text',
          content: response,
        },
      ];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      return [
        {
          type: 'text',
          content: `**Website Content Extraction Error**

**URL:** ${linkValue.url}
**Error:** ${errorMessage}

**Troubleshooting:**
- Verify the URL is accessible and publicly available
- Check if the website requires authentication
- Some websites may block automated access
- Try again later if this appears to be a temporary issue`,
        },
      ];
    }
  };
