import { ConfigService } from '@nestjs/config';
import { makeRebalancePortfolioTool } from './rebalance';
import { makePortfolioAnalyzerTool } from './portfolio-analyzer';
import { makeLiquidityProviderTool } from './liquidity-provider';

export function makeUniswapTools(configService: ConfigService) {
  const rebalancePortfolioTool = makeRebalancePortfolioTool(configService);
  const portfolioAnalyzerTool = makePortfolioAnalyzerTool(configService);
  const liquidityProviderTool = makeLiquidityProviderTool(configService);

  return {
    rebalancePortfolioTool,
    portfolioAnalyzerTool,
    liquidityProviderTool,
  };
}
