import { ToolFn, ToolOutputValue } from '../../utils/tools';
import { excludeTimeSeriesFields } from './utils';
import { ProtocolResponse } from './types';
import { getDefillamaRpcInstance } from './rpc';

export const getProtocolToolFn: ToolFn =
  () =>
  async ({ protocolId }): Promise<ToolOutputValue[]> => {
    try {
      const response = await getDefillamaRpcInstance().get<ProtocolResponse>(
        `/protocol/${protocolId.toLowerCase()}`
      );
      const protocol = response.data;

      // Exclude time-series data to make the response more manageable
      const prunedData = excludeTimeSeriesFields(protocol);

      return [
        {
          type: 'text',
          content: JSON.stringify(prunedData, null, 2),
        },
      ];
    } catch (error: any) {
      return [
        {
          type: 'system:error',
          content: `Failed to fetch protocol data: ${error.message}`,
        },
      ];
    }
  };
