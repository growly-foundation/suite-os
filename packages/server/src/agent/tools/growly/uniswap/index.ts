import { ConfigService } from '@nestjs/config';
import { makeRebalancePortfolioTool } from './rebalance';
import { makePortfolioAnalyzerTool } from './portfolio-analyzer';

export function makeUniswapTools(configService: ConfigService) {
  const rebalancePortfolioTool = makeRebalancePortfolioTool(configService);
  const portfolioAnalyzerTool = makePortfolioAnalyzerTool(configService);

  return { rebalancePortfolioTool, portfolioAnalyzerTool };
}
