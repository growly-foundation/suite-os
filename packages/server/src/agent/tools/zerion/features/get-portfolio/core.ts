import { ToolFn, ToolOutputValue } from '../../../../utils/tools';
import { isAddress } from 'viem';
import { getZerionAxiosInstance } from '../../rpc';
import { ZerionPortfolioResponse } from '../../types';
import { formatPortfolioData } from '../../utils';
import { ConfigService } from '@nestjs/config';

export const getPortfolioOverviewToolFn: ToolFn =
  (configService: ConfigService) =>
  async ({ walletAddress }): Promise<ToolOutputValue[]> => {
    if (!isAddress(walletAddress)) {
      return [
        {
          type: 'text',
          content: `Invalid wallet address: ${walletAddress}`,
        },
      ];
    }
    try {
      const response = await getZerionAxiosInstance(configService).get<ZerionPortfolioResponse>(
        `/wallets/${walletAddress}/portfolio?filter[positions]=no_filter&currency=usd`
      );
      const { data } = response.data;
      return [
        {
          type: 'text',
          content: formatPortfolioData(data),
        },
      ];
    } catch (error) {
      return [
        {
          type: 'system:error',
          content: `Failed to fetch portfolio: ${error.message}`,
        },
      ];
    }
  };
