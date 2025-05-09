import { DynamicStructuredTool } from '@langchain/core/tools';

import axios from 'axios';

import { z } from 'zod';
import { DEFILLAMA_BASE_URL } from './constants';
import { ProtocolResponse } from './types';
import { pruneGetProtocolResponse } from './utils';

const axiosInstance = axios.create({
  baseURL: DEFILLAMA_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

export const getProtocolTool = new DynamicStructuredTool({
  name: 'get_protocol',
  description: `
This tool will fetch detailed information about a specific protocol from DefiLlama.
It takes the following inputs:
- The protocol identifier from DefiLlama (e.g. uniswap)

Important notes:
- Returns null if the protocol is not found
- Returns comprehensive data including TVL, description, category, and other metadata
- Includes historical TVL data and chain-specific breakdowns where available
- Returns error message if the protocol ID is invalid or the request fails
- Prunes time-series data to 5 most recent entries to make the response more manageable
`,
  schema: z
    .object({
      protocolId: z.string().describe('The protocol identifier from DefiLlama'),
    })
    .strict(),
  func: async ({ protocolId }) => {
    try {
      const response = await axiosInstance.get<ProtocolResponse>(
        `/protocols/${protocolId}`,
      );
      const protocol = response.data;
      const prunedData = pruneGetProtocolResponse(protocol);

      return JSON.stringify(prunedData, null, 2);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return `Failed to fetch protocol data: ${error.message}`;
      }
      return 'Failed to fetch protocol data.';
    }
  },
});
