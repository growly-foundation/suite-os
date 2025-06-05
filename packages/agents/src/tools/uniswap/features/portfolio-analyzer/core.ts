import { isAddress } from 'viem';

import { ToolFn, ToolOutputValue } from '../../../../utils/tools';
import { getZerionAxiosInstance } from '../../../zerion/rpc';
import { ZerionFungiblePositionsResponse } from '../../../zerion/types';
import { processFungiblePositions } from '../../../zerion/utils';
import { PortfolioAnalysis, TokenInfo } from '../../types';
import { analyzeAndGenerateRebalanceStrategy } from '../common/rebalancing-logic';

function formatAnalysisResponse(
  analysis: PortfolioAnalysis,
  tokens: TokenInfo[],
  totalValue: number
): string {
  const {
    riskLevel,
    fromToken,
    toToken,
    swapAmount,
    swapAmountPercentage,
    detailedReason,
    stablecoinPercentage,
    largestTokenPercentage,
    chainCounts,
    tokenTypeCounts,
  } = analysis;

  // Format token listing (top 5)
  const topTokens = [...tokens]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(t => `- ${t.symbol}: $${t.value.toFixed(2)} (${t.percentage.toFixed(1)}%)`)
    .join('\n');

  // Format portfolio summary
  let summary = `
## Detailed Portfolio Analysis

**Total Value:** $${totalValue.toFixed(2)}
**Risk Level:** ${riskLevel}
**Stablecoin Allocation:** ${stablecoinPercentage.toFixed(1)}%
**Largest Position:** ${largestTokenPercentage.toFixed(1)}% of portfolio
**Blockchain Diversification:** ${chainCounts} chain(s)
**Position Types:** ${tokenTypeCounts} type(s)

### Top Holdings
${topTokens}

### Analysis & Recommendation
`;

  // Add rebalance recommendation if available
  if (fromToken && toToken && swapAmount > 0) {
    // Calculate the token amount based on actual price data from Zerion
    let tokenAmount = 0;

    // Use the price from Zerion data to calculate token amount
    if (fromToken.price > 0) {
      tokenAmount = swapAmount / fromToken.price;
    }

    // Use a default value if we couldn't calculate properly
    if (tokenAmount <= 0) {
      tokenAmount = 1;
    }

    // Calculate the percentage of the token being swapped
    const swapPercentage = Math.round(swapAmountPercentage * 100);

    summary += `
I recommend swapping **${tokenAmount.toFixed(6)} ${fromToken.symbol}** (about $${swapAmount.toFixed(2)}, ${swapPercentage}% of your holdings) to **${toToken.symbol}**.

### Detailed Reasoning
${detailedReason}

This rebalancing would optimize your portfolio based on your strategy preferences while maintaining appropriate risk exposure.
`;
  } else {
    summary += `
${detailedReason}
`;
  }
  return summary;
}

export const analyzePortfolioToolFn: ToolFn = () => {
  return async ({ walletAddress, strategy }): Promise<ToolOutputValue[]> => {
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
      // Generate portfolio analysis using shared rebalancing logic
      const analysis = analyzeAndGenerateRebalanceStrategy(tokens, strategy);
      // Format the response
      return [
        {
          type: 'text',
          content: formatAnalysisResponse(analysis, tokens, totalValue),
        },
      ];
    } catch (error: any) {
      return [
        {
          type: 'system:error',
          content: `Failed to analyze portfolio: ${error.message}`,
        },
      ];
    }
  };
};
