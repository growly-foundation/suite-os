import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { PromptTemplate } from '@langchain/core/prompts';

import { ChatModelFactory, ChatProvider } from '../utils/model.factory';

export interface ConversationContext {
  userMessage: string;
  agentResponse: string;
  conversationHistory?: Array<{ role: 'user' | 'agent'; content: string }>;
  agentCapabilities?: string[];
}

export interface RecommendationResult {
  recommendations: Record<string, string>; // keyword -> full_text_message
  reasoning?: string;
}

export class RecommendationService {
  private llm: BaseChatModel;
  private recommendationPrompt: PromptTemplate;

  constructor(provider: ChatProvider = 'openai', verbose = false) {
    // Use a fast, cost-effective model for recommendations
    this.llm = ChatModelFactory.create({
      provider,
      modelName: provider === 'openai' ? 'gpt-4o-mini' : undefined,
      temperature: 0.7,
      verbose,
    });

    this.recommendationPrompt = PromptTemplate.fromTemplate(`
You are an expert at analyzing Web3/DeFi conversations and generating contextual follow-up recommendations.

CONTEXT:
User Question: "{userMessage}"
Agent Response: "{agentResponse}"
Available Agent Capabilities: {agentCapabilities}

CONVERSATION HISTORY:
{conversationHistory}

TASK:
Analyze the conversation and generate 4-5 highly relevant follow-up questions or actions the user might want to take next. 

GUIDELINES:
1. **Context-Aware**: Base recommendations on what was just discussed
2. **Progressive**: Suggest next logical steps in their DeFi journey
3. **Personalized**: Consider the current context of the conversation
4. **Actionable**: Each recommendation should be a clear, specific question or request
5. **Diverse**: Cover different aspects (analysis, actions, learning, exploration)
6. **Keywords**: Create short, catchy keywords (2-4 words) that capture the essence

RECOMMENDATION CATEGORIES (mix these):
- **Deep Dive**: More detailed analysis of current topic
- **Next Steps**: Logical progression/actions to take
- **Related Topics**: Connected DeFi concepts
- **Portfolio Actions**: Wallet-specific recommendations
- **Market Insights**: Current trends and opportunities
- **Educational**: Learning about mentioned concepts

FORMAT:
Return ONLY a JSON object with this structure:
{{
  "recommendations": {{
    "Risk Analysis": "Show me the risk breakdown of my current portfolio",
    "Yield Farming": "What are the top yield farming opportunities right now?",
    "Gas Comparison": "Compare gas costs across different DEXs for this swap",
    "Staking vs Mining": "Explain the difference between liquidity mining and staking",
    "High APY Protocols": "Find protocols where I can earn over 10% APY safely"
  }},
  "reasoning": "Brief explanation of why these recommendations were chosen"
}}

KEYWORD GUIDELINES:
- Keep keywords short and memorable (2-4 words max)
- Make them action-oriented when possible
- Use DeFi terminology users understand
- Capture the core concept quickly

Generate recommendations now:
`);
  }

  async generateRecommendations(context: ConversationContext): Promise<RecommendationResult> {
    try {
      const conversationHistoryText =
        context.conversationHistory?.map(msg => `${msg.role}: ${msg.content}`).join('\n') ||
        'No previous history';

      const agentCapabilitiesText =
        context.agentCapabilities?.join(', ') ||
        'Portfolio analysis, DeFi protocol info, token swaps, yield farming insights, risk assessment';

      const prompt = await this.recommendationPrompt.format({
        userMessage: context.userMessage,
        agentResponse: context.agentResponse,
        agentCapabilities: agentCapabilitiesText,
        conversationHistory: conversationHistoryText,
      });

      const response = await this.llm.invoke(prompt);
      const content = response.content as string;

      // Parse the JSON response
      try {
        const parsed = JSON.parse(content);
        return {
          recommendations: parsed.recommendations || {},
          reasoning: parsed.reasoning,
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        console.warn('Failed to parse LLM recommendation response:', parseError);
        return this.getFallbackRecommendations(context);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(context);
    }
  }

  private getFallbackRecommendations(context: ConversationContext): RecommendationResult {
    // Fallback recommendations based on keywords
    const userMessage = context.userMessage.toLowerCase();
    const agentResponse = context.agentResponse.toLowerCase();

    if (userMessage.includes('portfolio') || agentResponse.includes('portfolio')) {
      return {
        recommendations: {
          'Risk Analysis': 'Analyze my portfolio risk exposure',
          'Token Allocation': 'Show me my token allocation breakdown',
          Rebalancing: 'Suggest portfolio rebalancing options',
          Performance: 'Compare my performance vs market',
          'Correlation Risks': 'Find correlation risks in my holdings',
        },
        reasoning: 'Portfolio-focused recommendations',
      };
    }

    if (userMessage.includes('defi') || agentResponse.includes('protocol')) {
      return {
        recommendations: {
          'Top Protocols': 'What are the highest TVL DeFi protocols?',
          'New Opportunities': 'Show me new DeFi opportunities',
          'Protocol Risks': 'Explain risks in DeFi protocols',
          'Yield Comparison': 'Compare lending vs staking yields',
          'Governance Tokens': 'Find protocols with governance tokens',
        },
        reasoning: 'DeFi protocol recommendations',
      };
    }

    // Default recommendations
    return {
      recommendations: {
        'Portfolio Analysis': 'Tell me about my portfolio performance',
        'Market Trends': 'What are the latest DeFi trends?',
        'Yield Opportunities': 'Help me find yield opportunities',
        'Market Conditions': 'Analyze current market conditions',
        'Gas Optimization': 'Show me gas-efficient transactions',
      },
      reasoning: 'General DeFi recommendations',
    };
  }
}
