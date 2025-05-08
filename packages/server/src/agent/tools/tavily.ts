import { TavilySearch } from '@langchain/tavily';

const tavilySearchTool = new TavilySearch({
  maxResults: 3,
  topic: 'general',
  // includeAnswer: false,
  // includeRawContent: false,
  // includeImages: false,
  // includeImageDescriptions: false,
  // searchDepth: "basic",
  // timeRange: "day",
  // includeDomains: [],
  // excludeDomains: [],
});

export default tavilySearchTool;
