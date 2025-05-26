import { ToolFn, ToolOutputValue } from '../../../../utils/tools';
import { isAddress } from 'viem';
import { getZerionAxiosInstance } from '../../rpc';
import { ConfigService } from '@nestjs/config';
import { ZerionFungiblePositionsResponse } from '../../types';
import { formatPositionsData } from '../../utils';

export const getFungiblesPositionsToolFn: ToolFn =
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
      const response = await getZerionAxiosInstance(
        configService
      ).get<ZerionFungiblePositionsResponse>(
        `/wallets/${walletAddress}/positions?filter[positions]=no_filter&currency=usd&filter[trash]=only_non_trash&sort=value`
      );
      const { data } = response.data;
      return [
        {
          type: 'text',
          content: formatPositionsData(data),
        },
      ];
    } catch (error) {
      return [
        {
          type: 'system:error',
          content: `Failed to fetch token holdings data: ${error.message}`,
        },
      ];
    }
  };
