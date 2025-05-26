import { ConfigService } from '@nestjs/config';
import { makeGetFungiblePositionsTool } from './features/get-fungible-positions';
import { makePortfolioOverviewTool } from './features/get-portfolio';

export function makeZerionTools(configService: ConfigService) {
  return {
    getPortfolioOverviewTool: makePortfolioOverviewTool(configService),
    getFungiblePositionsTool: makeGetFungiblePositionsTool(configService),
  };
}
