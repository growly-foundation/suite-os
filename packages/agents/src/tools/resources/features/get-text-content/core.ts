import { ToolOutputValue } from '../../../../utils/tools';
import { getResourceContext } from '../get-resource-details/core';

// Text analysis functions
const analyzeTextType = (
  content: string
): {
  type: string;
  confidence: number;
  indicators: string[];
} => {
  const indicators: string[] = [];
  let type = 'General Text';
  let confidence = 0.5;

  // Code detection
  if (
    content.match(/\b(function|class|import|export|const|let|var|if|else|for|while)\b/g) ||
    content.includes('```') ||
    content.match(/\{[\s\S]*\}/) ||
    content.match(/\b(def|print|return|import|from)\b/g) // Python
  ) {
    type = 'Code/Technical';
    confidence = 0.9;
    indicators.push('Programming keywords', 'Code syntax', 'Technical structure');
  }

  // Documentation/Manual detection
  else if (
    content.match(/\b(installation|setup|configuration|tutorial|guide|step|section|chapter)\b/gi) ||
    content.match(/^\s*#+\s+/gm) || // Markdown headers
    content.match(/\d+\.\s+/) // Numbered steps
  ) {
    type = 'Documentation';
    confidence = 0.85;
    indicators.push('Instructional language', 'Structured sections', 'Step-by-step format');
  }

  // Academic/Research detection
  else if (
    content.match(
      /\b(abstract|introduction|methodology|conclusion|references|bibliography|research|study|analysis)\b/gi
    ) ||
    content.match(/\b(et al\.|ibid\.|op\. cit\.)\b/gi) ||
    content.match(/\[\d+\]/) // Citations
  ) {
    type = 'Academic/Research';
    confidence = 0.8;
    indicators.push('Academic terminology', 'Citation format', 'Research structure');
  }

  // Legal document detection
  else if (
    content.match(
      /\b(whereas|therefore|hereby|pursuant|agreement|contract|terms|conditions|liability)\b/gi
    ) ||
    content.match(/\b(section|subsection|clause|article|paragraph)\b/gi) ||
    content.match(/\b(shall|must|may not|prohibited)\b/gi)
  ) {
    type = 'Legal Document';
    confidence = 0.85;
    indicators.push('Legal terminology', 'Formal structure', 'Contractual language');
  }

  // Business/Corporate detection
  else if (
    content.match(
      /\b(revenue|profit|quarterly|annual|stakeholder|shareholder|executive|board|strategy)\b/gi
    ) ||
    content.match(/\b(KPI|ROI|Q[1-4]|FY\d{4}|CEO|CFO|CTO)\b/gi)
  ) {
    type = 'Business/Corporate';
    confidence = 0.8;
    indicators.push('Business terminology', 'Corporate metrics', 'Executive language');
  }

  // Creative writing detection
  else if (
    content.match(/"[^"]{20,}"/g) && // Dialogue
    content.match(/\b(said|whispered|shouted|thought|felt|looked|walked)\b/gi) &&
    content.split('\n').length > 10
  ) {
    type = 'Creative Writing';
    confidence = 0.7;
    indicators.push('Dialogue patterns', 'Narrative language', 'Descriptive text');
  }

  // News/Journalism detection
  else if (
    content.match(
      /\b(reported|according to|sources|journalist|correspondent|breaking|update)\b/gi
    ) ||
    content.match(
      /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\w+\s+\d{1,2}/gi
    ) ||
    content.match(/\d{1,2}:\d{2}\s+(AM|PM)/gi)
  ) {
    type = 'News/Journalism';
    confidence = 0.8;
    indicators.push('Journalistic language', 'Date/time references', 'Source attribution');
  }

  // Email/Communication detection
  else if (
    content.match(/\b(Dear|Hi|Hello|Sincerely|Best regards|Thank you|Subject:|From:|To:)\b/gi) ||
    content.match(/@\w+\.\w+/) || // Email addresses
    content.match(/\b(meeting|call|follow up|action items)\b/gi)
  ) {
    type = 'Email/Communication';
    confidence = 0.8;
    indicators.push('Greeting/closing patterns', 'Email structure', 'Communication language');
  }

  return { type, confidence, indicators };
};

const analyzeSentiment = (
  content: string
): {
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  indicators: string[];
} => {
  const positiveWords = [
    'good',
    'great',
    'excellent',
    'amazing',
    'wonderful',
    'fantastic',
    'perfect',
    'love',
    'like',
    'enjoy',
    'happy',
    'pleased',
    'satisfied',
    'success',
    'win',
    'achieve',
    'accomplish',
    'improve',
    'benefit',
    'advantage',
    'opportunity',
    'solution',
    'effective',
    'efficient',
    'valuable',
    'useful',
    'helpful',
    'positive',
    'optimistic',
    'confident',
    'excited',
    'thrilled',
  ];

  const negativeWords = [
    'bad',
    'terrible',
    'awful',
    'horrible',
    'worst',
    'hate',
    'dislike',
    'angry',
    'frustrated',
    'disappointed',
    'sad',
    'upset',
    'problem',
    'issue',
    'error',
    'fail',
    'failure',
    'difficult',
    'challenge',
    'concern',
    'worry',
    'risk',
    'threat',
    'disadvantage',
    'ineffective',
    'useless',
    'harmful',
    'negative',
    'pessimistic',
    'doubtful',
    'uncertain',
    'concerned',
  ];

  const words = content.toLowerCase().match(/\b\w+\b/g) || [];

  let positiveCount = 0;
  let negativeCount = 0;
  const foundPositive: string[] = [];
  const foundNegative: string[] = [];

  words.forEach(word => {
    if (positiveWords.includes(word)) {
      positiveCount++;
      if (!foundPositive.includes(word)) foundPositive.push(word);
    }
    if (negativeWords.includes(word)) {
      negativeCount++;
      if (!foundNegative.includes(word)) foundNegative.push(word);
    }
  });

  const totalSentimentWords = positiveCount + negativeCount;
  const indicators: string[] = [];

  if (totalSentimentWords === 0) {
    return {
      sentiment: 'Neutral',
      confidence: 0.5,
      indicators: ['No clear sentiment indicators found'],
    };
  }

  const positiveRatio = positiveCount / totalSentimentWords;
  const confidence = Math.min(0.9, (totalSentimentWords / words.length) * 10);

  if (positiveRatio > 0.6) {
    indicators.push(`Positive terms: ${foundPositive.slice(0, 5).join(', ')}`);
    return { sentiment: 'Positive', confidence, indicators };
  } else if (positiveRatio < 0.4) {
    indicators.push(`Negative terms: ${foundNegative.slice(0, 5).join(', ')}`);
    return { sentiment: 'Negative', confidence, indicators };
  } else {
    indicators.push('Mixed sentiment indicators');
    return { sentiment: 'Neutral', confidence: confidence * 0.7, indicators };
  }
};

const extractKeyTopics = (content: string): string[] => {
  // Remove common stop words and extract meaningful terms
  const stopWords = new Set([
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
    'way',
    'many',
    'then',
    'them',
    'well',
    'were',
    'will',
    'with',
    'have',
    'this',
    'that',
    'from',
    'they',
    'know',
    'want',
    'been',
    'good',
    'much',
    'some',
    'time',
    'very',
    'when',
    'come',
    'here',
    'just',
    'like',
    'long',
    'make',
    'over',
    'such',
    'take',
    'than',
    'only',
    'think',
    'also',
    'back',
    'after',
    'first',
    'well',
    'year',
    'work',
    'where',
    'would',
    'there',
    'could',
    'should',
  ]);

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
};

const analyzeTextStructure = (
  content: string
): {
  paragraphs: number;
  sentences: number;
  words: number;
  characters: number;
  avgWordsPerSentence: number;
  avgSentencesPerParagraph: number;
  readingLevel: string;
} => {
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = content.split(/\s+/).filter(w => w.trim().length > 0).length;
  const characters = content.length;

  const avgWordsPerSentence = sentences > 0 ? Math.round(words / sentences) : 0;
  const avgSentencesPerParagraph = paragraphs > 0 ? Math.round(sentences / paragraphs) : 0;

  // Simple reading level estimation based on average sentence length
  let readingLevel = 'Elementary';
  if (avgWordsPerSentence > 20) {
    readingLevel = 'Advanced';
  } else if (avgWordsPerSentence > 15) {
    readingLevel = 'College';
  } else if (avgWordsPerSentence > 12) {
    readingLevel = 'High School';
  } else if (avgWordsPerSentence > 8) {
    readingLevel = 'Middle School';
  }

  return {
    paragraphs,
    sentences,
    words,
    characters,
    avgWordsPerSentence,
    avgSentencesPerParagraph,
    readingLevel,
  };
};

const generateTextSummary = (content: string, maxLength = 300): string => {
  if (content.length <= maxLength) {
    return content;
  }

  // Try to find natural break points
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let summary = '';

  for (const sentence of sentences) {
    if ((summary + sentence).length <= maxLength) {
      summary += sentence.trim() + '. ';
    } else {
      break;
    }
  }

  if (summary.length === 0) {
    // If no complete sentences fit, just truncate
    summary = content.substring(0, maxLength - 3) + '...';
  }

  return summary.trim();
};

export const getTextContentToolFn =
  () =>
  async (args: {
    resourceId: string;
    includeAnalysis?: boolean;
    maxLength?: number;
  }): Promise<ToolOutputValue[]> => {
    const { resourceId, includeAnalysis = true, maxLength = 10000 } = args;

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

    if (resource.type !== 'text') {
      return [
        {
          type: 'system:error',
          content: `Resource "${resourceId}" is not a text resource. Use get_contract_abi for contracts, get_website_content for websites, or get_document_content for documents.`,
        },
      ];
    }

    const textValue = resource.value;
    if (!textValue?.content) {
      return [
        {
          type: 'text',
          content: `**Text Resource: ${resource.name || resourceId}**

**Status:** No content available

The text resource exists but does not contain any content. This might indicate:
- The resource was created but content was not added
- Content was removed or corrupted
- There was an error during resource creation`,
        },
      ];
    }

    let content = textValue.content;
    const originalLength = content.length;

    // Truncate content if too long
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '\n\n... (content truncated)';
    }

    let response = `**Text Content Analysis**\n\n`;
    response += `**Resource:** ${resource.name || resourceId}\n`;
    response += `**Format:** ${textValue.format || 'plain'}\n`;
    response += `**Content Length:** ${originalLength.toLocaleString()} characters\n`;
    if (originalLength > maxLength) {
      response += `**Note:** Content truncated to ${maxLength.toLocaleString()} characters\n`;
    }
    response += `\n`;

    if (includeAnalysis) {
      // Text type analysis
      const typeAnalysis = analyzeTextType(content);
      response += `**Content Analysis:**\n`;
      response += `- **Type:** ${typeAnalysis.type} (${Math.round(typeAnalysis.confidence * 100)}% confidence)\n`;
      if (typeAnalysis.indicators.length > 0) {
        response += `- **Indicators:** ${typeAnalysis.indicators.join(', ')}\n`;
      }
      response += `\n`;

      // Sentiment analysis
      const sentimentAnalysis = analyzeSentiment(content);
      response += `**Sentiment Analysis:**\n`;
      response += `- **Overall Sentiment:** ${sentimentAnalysis.sentiment} (${Math.round(sentimentAnalysis.confidence * 100)}% confidence)\n`;
      if (sentimentAnalysis.indicators.length > 0) {
        response += `- **Indicators:** ${sentimentAnalysis.indicators.join(', ')}\n`;
      }
      response += `\n`;

      // Text structure analysis
      const structure = analyzeTextStructure(content);
      response += `**Text Structure:**\n`;
      response += `- **Paragraphs:** ${structure.paragraphs}\n`;
      response += `- **Sentences:** ${structure.sentences}\n`;
      response += `- **Words:** ${structure.words.toLocaleString()}\n`;
      response += `- **Average Words per Sentence:** ${structure.avgWordsPerSentence}\n`;
      response += `- **Reading Level:** ${structure.readingLevel}\n`;
      response += `- **Estimated Reading Time:** ${Math.ceil(structure.words / 200)} minutes\n`;
      response += `\n`;

      // Key topics
      const topics = extractKeyTopics(content);
      if (topics.length > 0) {
        response += `**Key Topics:**\n`;
        response += `${topics.slice(0, 8).join(', ')}\n\n`;
      }

      // Content summary
      const summary = generateTextSummary(content);
      response += `**Content Summary:**\n${summary}\n\n`;
    }

    // Format content based on specified format
    if (textValue.format === 'markdown') {
      response += `**Full Content (Markdown):**\n\n${content}`;
    } else {
      response += `**Full Content:**\n\n${content}`;
    }

    return [
      {
        type: 'text',
        content: response,
      },
    ];
  };
