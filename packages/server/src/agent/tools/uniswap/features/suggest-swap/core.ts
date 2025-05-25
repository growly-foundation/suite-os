import { createSwapBySymbols, formatSwapResponse } from '../../swap-utils';
import { TokenListManager } from '../../../../../config/token-list';

export const suggestSwap = () => {
  // Create token list manager
  const tokenListManager = new TokenListManager();

  return async ({ fromToken, toToken, amount, chain, reason }) => {
    try {
      // Create a swap recommendation by symbols
      const recommendation = await createSwapBySymbols(
        fromToken,
        toToken,
        amount,
        chain,
        reason,
        tokenListManager
      );

      if (!recommendation) {
        return `Unable to create a swap link for ${fromToken} to ${toToken} on ${chain}. One or both tokens may not be supported or found in our token lists.`;
      }

      // Format the response
      return formatSwapResponse(recommendation);
    } catch (error) {
      if (error instanceof Error) {
        return `Failed to generate swap suggestion: ${error.message}`;
      }
      return 'Failed to generate swap suggestion.';
    }
  };
};
