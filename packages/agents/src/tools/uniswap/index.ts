import { makeRebalancePortfolioTool } from './features/rebalance';
import { makePortfolioAnalyzerTool } from './features/portfolio-analyzer';
import { makeLiquidityProviderTool } from './features/liquidity-provider';
import { makeSuggestSwapTool } from './features/suggest-swap';
import { makeGenerateIntentTool } from './features/generate-intent';

export function makeUniswapTools() {
  const rebalancePortfolioTool = makeRebalancePortfolioTool();
  const portfolioAnalyzerTool = makePortfolioAnalyzerTool();
  const liquidityProviderTool = makeLiquidityProviderTool();
  const suggestSwapTool = makeSuggestSwapTool();
  const generateIntentTool = makeGenerateIntentTool();

  return {
    rebalancePortfolioTool,
    portfolioAnalyzerTool,
    liquidityProviderTool,
    suggestSwapTool,
    generateIntentTool,
  };
}
