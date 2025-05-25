import { ConfigService } from '@nestjs/config';
import { makeRebalancePortfolioTool } from './features/rebalance';
import { makePortfolioAnalyzerTool } from './features/portfolio-analyzer';
import { makeLiquidityProviderTool } from './features/liquidity-provider';
import { makeSuggestSwapTool } from './features/suggest-swap';

export function makeUniswapTools(configService: ConfigService) {
  const rebalancePortfolioTool = makeRebalancePortfolioTool(configService);
  const portfolioAnalyzerTool = makePortfolioAnalyzerTool(configService);
  const liquidityProviderTool = makeLiquidityProviderTool(configService);
  const suggestSwapTool = makeSuggestSwapTool();

  return {
    rebalancePortfolioTool,
    portfolioAnalyzerTool,
    liquidityProviderTool,
    suggestSwapTool,
  };
}
