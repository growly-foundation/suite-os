import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatBedrockConverse } from '@langchain/aws';
import { Tool } from '@langchain/core/tools';
import { ConfigService } from '@nestjs/config';
import { StateGraph, StateGraphArgs } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { makePortfolioAnalysisTool } from './tools/rebalance/rebalance';
import { makePortfolioEvaluatorTool } from './tools/rebalance/evaluator';
import { makeZerionTools } from './tools/zerion/zerion';

// Define the state type for our graph
interface AgentState {
  messages: BaseMessage[];
  steps: string[];
}

// Define the rebalance recommendation structure
interface RebalanceRecommendation {
  fromToken: string | null;
  toToken: string | null;
  amount: number | null;
  reason: string;
  shouldRebalance: boolean;
}

/**
 * Creates a DeFi rebalancing agent using LangGraph that will:
 * 1. Analyze user portfolio
 * 2. Let the LLM evaluate the portfolio data
 * 3. Dynamically decide whether to suggest a rebalance
 * 4. If a rebalance is needed, output in structured format (fromToken, toToken, amount)
 */
export function createDeFiRebalanceAgent(configService: ConfigService) {
  // Initialize LLM
  const llm = new ChatBedrockConverse({
    model: 'us.meta.llama3-3-70b-instruct-v1:0',
    temperature: 0.2,
    region: configService.get('BEDROCK_AWS_REGION') || 'us-east-1',
    credentials: {
      accessKeyId: configService.get('BEDROCK_AWS_ACCESS_KEY_ID')!,
      secretAccessKey: configService.get('BEDROCK_AWS_SECRET_ACCESS_KEY')!,
    },
  });

  // Initialize tools
  const { getPortfolioOverviewTool, getFungiblePositionsTool } = makeZerionTools(configService);
  const portfolioAnalysisTool = makePortfolioAnalysisTool(configService);
  const portfolioEvaluatorTool = makePortfolioEvaluatorTool(configService);

  // Create tools array
  const tools = [
    getPortfolioOverviewTool,
    getFungiblePositionsTool,
    portfolioAnalysisTool,
    portfolioEvaluatorTool
  ];

  // System prompt for the rebalancing agent
  const systemPrompt = `You are a DeFi Portfolio Manager specializing in portfolio optimization.
Your task is to help users optimize their crypto portfolios by suggesting rebalancing actions when appropriate.

When a user asks for portfolio advice or rebalancing suggestions, follow this process:
1. First, fetch their current portfolio using the get_portfolio_overview tool to get a high-level view.
2. Then, get detailed token holdings using the get_fungible_positions tool to understand specific allocations.
3. Next, use the analyze_portfolio_data tool to get structured data about their portfolio allocations and metrics.
4. Finally, use the evaluate_portfolio_for_rebalancing tool to determine if rebalancing is needed, and if so, what specific action to take.

The evaluation will tell you:
- Whether rebalancing is recommended (shouldRebalance: true/false)
- If recommended, which token to sell (fromToken)
- If recommended, which token to buy (toToken)
- If recommended, how much to sell (amount)
- The reasoning behind the recommendation (reason)

Possible scenarios:
1. If rebalancing IS recommended, explain the recommendation in a clear, structured format showing:
   - fromToken: The token to sell/reduce
   - toToken: The token to buy/increase
   - amount: The exact amount of fromToken to sell
   - The reasoning behind this recommendation

2. If rebalancing is NOT recommended, explain why the portfolio is well-balanced or why now isn't a good time to rebalance.

Be sure to consider:
- Over-concentration in specific assets
- Portfolio diversification
- Recent price movements
- Market conditions
- Risk management

Respond ONLY with facts and analysis based on the portfolio data, NOT speculation.
`;

  // Create a ReAct agent using the LangGraph prebuilt agent
  const agent = createReactAgent({
    llm,
    tools,
    prompt: systemPrompt,
  });

  /**
   * Helper function to convert the agent's final output to a structured rebalance recommendation
   */
  function extractRebalanceRecommendation(aiMessage: AIMessage): RebalanceRecommendation {
    const content = aiMessage.content.toString();

    // Try to find a structured JSON object in the response
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = content.match(jsonRegex);

    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        // Ensure the result has the expected structure
        return {
          fromToken: parsed.fromToken || null,
          toToken: parsed.toToken || null,
          amount: parsed.amount !== undefined ? parsed.amount : null,
          reason: parsed.reason || 'No reason provided',
          shouldRebalance: !!parsed.shouldRebalance
        };
      } catch (e) {
        console.error('Failed to parse JSON from response', e);
      }
    }

    // Determine if rebalancing is recommended based on content
    const shouldRebalance = 
      !content.toLowerCase().includes('not recommended') && 
      !content.toLowerCase().includes('not needed') &&
      !content.toLowerCase().includes('well balanced') &&
      !content.toLowerCase().includes('no need to rebalance');

    // Fallback: Try to extract the fields from the text
    const fromTokenMatch = content.match(/fromToken:?\s*["']?([A-Za-z0-9]+)["']?/i);
    const toTokenMatch = content.match(/toToken:?\s*["']?([A-Za-z0-9]+)["']?/i);
    const amountMatch = content.match(/amount:?\s*([\d.]+)/i);
    
    // Only use these values if rebalancing is recommended
    const fromToken = shouldRebalance && fromTokenMatch ? fromTokenMatch[1] : null;
    const toToken = shouldRebalance && toTokenMatch ? toTokenMatch[1] : null;
    const amount = shouldRebalance && amountMatch ? parseFloat(amountMatch[1]) : null;

    return {
      fromToken,
      toToken,
      amount,
      reason: content.substring(0, 300).trim() + '...', // Truncate for reasonably sized reason
      shouldRebalance
    };
  }

  /**
   * Invoke the rebalance agent to get a recommendation
   */
  async function getRebalanceRecommendation(
    walletAddress: string,
    userQuery = ''
  ): Promise<{
    fromToken: string | null;
    toToken: string | null;
    amount: number | null;
    reason: string;
    shouldRebalance: boolean;
    fullResponse: string;
  }> {
    // Invoke the agent with the user's query
    const result = await agent.invoke({
      messages: [
        new SystemMessage(systemPrompt),
        new HumanMessage(
          `I need an analysis of my crypto portfolio to determine if rebalancing is appropriate. ` +
          `My wallet address is ${walletAddress}. ${userQuery}`
        ),
      ],
    });

    // Get the last message (the final agent response)
    const aiMessage = result.messages[result.messages.length - 1] as AIMessage;
    const recommendation = extractRebalanceRecommendation(aiMessage);

    return {
      ...recommendation,
      fullResponse: aiMessage.content.toString(),
    };
  }

  return {
    agent,
    getRebalanceRecommendation,
  };
}
