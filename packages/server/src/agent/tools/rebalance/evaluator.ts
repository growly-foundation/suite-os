import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatBedrockConverse } from '@langchain/aws';
import { ConfigService } from '@nestjs/config';

// Define the rebalance recommendation structure
export interface RebalanceRecommendation {
  fromToken: string | null;
  toToken: string | null;
  amount: number | null;
  reason: string;
  shouldRebalance: boolean;
}

/**
 * Creates a tool that uses the LLM to evaluate portfolio data and make rebalancing decisions
 * 
 * This approach delegates the evaluation logic to the LLM instead of using
 * hardcoded rules, allowing for more nuanced and contextual decisions.
 */
export function makePortfolioEvaluatorTool(configService: ConfigService) {
  // Initialize LLM for evaluation
  const llm = new ChatBedrockConverse({
    model: 'us.meta.llama3-3-70b-instruct-v1:0',
    temperature: 0.2,
    region: configService.get('BEDROCK_AWS_REGION') || 'us-east-1',
    credentials: {
      accessKeyId: configService.get('BEDROCK_AWS_ACCESS_KEY_ID')!,
      secretAccessKey: configService.get('BEDROCK_AWS_SECRET_ACCESS_KEY')!,
    },
  });

  return new DynamicStructuredTool({
    name: 'evaluate_portfolio_for_rebalancing',
    description: `
Evaluates portfolio data and determines whether rebalancing is needed.
If rebalancing is recommended, it specifies which token to sell, which to buy,
and how much to sell.

Input:
- portfolioData: JSON string containing portfolio data.
- userPreferences: Optional string with user preferences like risk tolerance.

Output:
- Rebalancing recommendation with fromToken, toToken, amount, and reasoning.
- Will indicate if no rebalancing is needed.
`,
    schema: z
      .object({
        portfolioData: z
          .string()
          .describe('JSON string containing structured portfolio data to evaluate'),
        userPreferences: z
          .string()
          .optional()
          .describe('Optional user preferences like risk tolerance, rebalance goals, etc.')
      })
      .strip()
      .describe('Input schema for portfolio evaluation'),
    func: async ({ portfolioData, userPreferences = '' }) => {
      try {
        // Parse the portfolio data
        const portfolioJson = JSON.parse(portfolioData);
        
        // If portfolio can't be rebalanced, return early
        if (portfolioJson.canRebalance === false) {
          return JSON.stringify({
            shouldRebalance: false,
            fromToken: null,
            toToken: null,
            amount: null,
            reason: portfolioJson.reason || "Portfolio cannot be rebalanced"
          });
        }

        // Create a system prompt for the LLM to evaluate
        const systemPrompt = `
You are a DeFi portfolio advisor specializing in crypto asset allocation.
Analyze the portfolio data and determine if rebalancing is needed.

If rebalancing IS needed, provide:
1. fromToken: Which token to sell (symbol)
2. toToken: Which token to buy (symbol)
3. amount: Exact amount of fromToken to sell (numeric value only)
4. reason: Clear explanation of why this rebalance is recommended
5. shouldRebalance: Set to true

If rebalancing is NOT needed, provide:
1. fromToken: null
2. toToken: null
3. amount: null
4. reason: Clear explanation of why rebalancing is not recommended
5. shouldRebalance: Set to false

Consider these factors in your evaluation:
- Over-concentration in single assets (typically >50% in one token)
- Diversification across major assets
- Recent price movements and volatility
- Token quality and fundamentals

Format your response as JSON with the fields described above.
`;

        // Prepare user message with portfolio data and preferences
        const userMessage = `
Please evaluate this crypto portfolio and determine if it needs rebalancing:

Portfolio Data:
${portfolioData}

${userPreferences ? `User Preferences: ${userPreferences}` : ''}

Provide your recommendation in JSON format with fromToken, toToken, amount, reason, and shouldRebalance fields.
`;

        // Get LLM evaluation
        const response = await llm.invoke([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]);

        // Extract JSON from the response
        let recommendation: RebalanceRecommendation;
        
        try {
          // Try to parse JSON directly from the response
          const content = response.content.toString();
          // Extract JSON if it's wrapped in backticks
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          
          if (jsonMatch && jsonMatch[1]) {
            recommendation = JSON.parse(jsonMatch[1]);
          } else {
            // Try to parse the entire response as JSON
            recommendation = JSON.parse(content);
          }
        } catch (error) {
          // Fallback: Create a structured response from the text
          const content = response.content.toString();
          
          // Check if the response recommends rebalancing
          const shouldRebalance = !content.toLowerCase().includes('not recommended') && 
                                 !content.toLowerCase().includes('not needed');
          
          // Extract potential token symbols
          const fromTokenMatch = content.match(/from(?:\s*|:)(?:token)?\s*["']?([A-Za-z0-9]+)["']?/i);
          const toTokenMatch = content.match(/to(?:\s*|:)(?:token)?\s*["']?([A-Za-z0-9]+)["']?/i);
          const amountMatch = content.match(/amount(?:\s*|:)\s*([\d.]+)/i);
          
          recommendation = {
            shouldRebalance,
            fromToken: shouldRebalance && fromTokenMatch ? fromTokenMatch[1] : null,
            toToken: shouldRebalance && toTokenMatch ? toTokenMatch[1] : null,
            amount: shouldRebalance && amountMatch ? parseFloat(amountMatch[1]) : null,
            reason: content.substring(0, 500) // Truncate to reasonable length
          };
        }

        return JSON.stringify(recommendation);
      } catch (error: unknown) {
        if (error instanceof Error) {
          return JSON.stringify({ 
            error: `Failed to evaluate portfolio: ${error.message}`,
            shouldRebalance: false,
            fromToken: null,
            toToken: null,
            amount: null,
            reason: `Error processing request: ${error.message}`
          });
        }
        return JSON.stringify({ 
          error: 'Failed to evaluate portfolio due to unknown error',
          shouldRebalance: false,
          fromToken: null,
          toToken: null,
          amount: null,
          reason: "An unknown error occurred while evaluating the portfolio"
        });
      }
    },
  });
}
