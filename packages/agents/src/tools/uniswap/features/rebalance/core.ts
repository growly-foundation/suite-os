import { isAddress } from 'viem';

import { TokenListManager } from '../../../../config/token-list';
import { ToolFn, ToolOutputValue } from '../../../../utils/tools';
import { getZerionAxiosInstance } from '../../../zerion/rpc';
import { ZerionFungiblePositionsResponse } from '../../../zerion/types';
import { processFungiblePositions } from '../../../zerion/utils';
import { createSwapRecommendation, updateSwapWithTokenAddresses } from '../../swap-utils';
import { RebalanceRecommendation, RebalancingStrategy, TokenInfo } from '../../types';
import { analyzeAndGenerateRebalanceStrategy } from '../common/rebalancing-logic';

export function generateRebalanceRecommendation(
  tokens: TokenInfo[],
  strategy: RebalancingStrategy
): RebalanceRecommendation | null {
  // Use the shared sophisticated rebalancing logic
  const analysis = analyzeAndGenerateRebalanceStrategy(tokens, strategy);

  if (!analysis.fromToken || !analysis.toToken || analysis.swapAmount <= 0) {
    return null;
  }

  return createSwapRecommendation(
    analysis.fromToken,
    analysis.toToken,
    analysis.detailedReason,
    analysis.swapAmount
  );
}

export const analyzeAndSuggestRebalance: ToolFn =
  () =>
  async ({
    walletAddress,
    strategy,
  }: {
    walletAddress: string;
    strategy: RebalancingStrategy;
  }): Promise<ToolOutputValue[]> => {
    if (!isAddress(walletAddress)) {
      return [
        {
          type: 'system:error',
          content: `Invalid wallet address: ${walletAddress}`,
        },
      ];
    }
    try {
      // Fetch the user's portfolio positions using Zerion
      const response = await getZerionAxiosInstance().get<ZerionFungiblePositionsResponse>(
        `/wallets/${walletAddress}/positions?filter[positions]=no_filter&currency=usd&filter[trash]=only_non_trash&sort=value`
      );
      const { data } = response.data;
      // Process the portfolio data
      const tokens: TokenInfo[] = processFungiblePositions(data);
      // Calculate total value and percentages
      const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
      tokens.forEach(token => {
        token.percentage = (token.value / totalValue) * 100;
      });

      // Generate rebalance recommendation using shared sophisticated logic
      const analysis = analyzeAndGenerateRebalanceStrategy(tokens, strategy);

      if (!analysis.fromToken || !analysis.toToken || analysis.swapAmount <= 0) {
        return [
          {
            type: 'text',
            content: `
## Portfolio Rebalance Analysis

${analysis.detailedReason}

**Portfolio Summary:**
- Total Value: $${totalValue.toFixed(2)}
- Risk Level: ${analysis.riskLevel}
- Stablecoin Allocation: ${analysis.stablecoinPercentage.toFixed(1)}%
- Largest Position: ${analysis.largestTokenPercentage.toFixed(1)}% of portfolio
- Blockchain Diversification: ${analysis.chainCounts} chain(s)
`,
          },
        ];
      }

      // Calculate token amount for display
      let tokenAmount = 0;
      if (analysis.fromToken.price > 0) {
        tokenAmount = analysis.swapAmount / analysis.fromToken.price;
      }

      // Create recommendation with token addresses
      const recommendation = createSwapRecommendation(
        analysis.fromToken,
        analysis.toToken,
        analysis.detailedReason,
        analysis.swapAmount
      );

      // Update the recommendation with token addresses from token lists
      const updatedRecommendation = await updateSwapWithTokenAddresses(
        recommendation,
        new TokenListManager()
      );

      const swapPercentage = Math.round(analysis.swapAmountPercentage * 100);

      // Format the response with detailed analysis
      const { fromToken, toToken, uniswapLink, valueToSwap } = updatedRecommendation;

      return [
        {
          type: 'text',
          content: `
## Portfolio Rebalance Recommendation

I suggest swapping **${tokenAmount.toFixed(6)} ${fromToken.symbol}** (about $${valueToSwap.toFixed(2)}, ${swapPercentage}% of your ${fromToken.symbol} holdings) to **${toToken.symbol}**.

### Strategic Analysis
${analysis.detailedReason}

### Portfolio Context
- **Total Value:** $${totalValue.toFixed(2)}
- **Risk Level:** ${analysis.riskLevel}
- **Stablecoin Allocation:** ${analysis.stablecoinPercentage.toFixed(1)}%
- **Largest Position:** ${analysis.largestTokenPercentage.toFixed(1)}% of portfolio
- **Blockchain Diversification:** ${analysis.chainCounts} chain(s)

### Current Allocation
- **${fromToken.symbol}:** $${fromToken.value.toFixed(2)} (${fromToken.percentage.toFixed(2)}% of portfolio)
- **${toToken.symbol}:** $${toToken.value.toFixed(2)} (${toToken.percentage.toFixed(2)}% of portfolio)

### After Rebalancing (Estimated)
- **${fromToken.symbol}:** $${(fromToken.value - valueToSwap).toFixed(2)} (${(((fromToken.value - valueToSwap) / totalValue) * 100).toFixed(1)}% of portfolio)
- **${toToken.symbol}:** $${(toToken.value + valueToSwap).toFixed(2)} (${(((toToken.value + valueToSwap) / totalValue) * 100).toFixed(1)}% of portfolio)

### Execute the Swap
You can execute this swap on Uniswap: ${uniswapLink}
`,
        },
        {
          type: 'uniswap:swap',
          content: {
            fromToken,
            toToken,
            amount: tokenAmount,
            link: uniswapLink,
          },
        },
      ];
    } catch (error: any) {
      return [
        {
          type: 'system:error',
          content: `Failed to generate rebalance suggestions: ${error.message}`,
        },
      ];
    }
  };
