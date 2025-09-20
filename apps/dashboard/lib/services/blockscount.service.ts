import axios from 'axios';

import type {
  BlockscoutTokenTransfer,
  BlockscoutTransaction,
  GetAddressCounterResponse,
  GetAddressTokenTransfersResponse,
  GetAddressTransactionsResponse,
} from '../../types/blockscount';

export interface BlockscoutServiceConfig {
  baseUrl: string;
}

export interface TokenTransferFilters {
  type?: string; // ERC-20, ERC-721, ERC-1155
  filter?: string; // to | from
  token?: string; // token address
}

export class BlockscoutService {
  private config: BlockscoutServiceConfig;

  constructor(config: BlockscoutServiceConfig) {
    this.config = config;
  }

  /**
   * Get address counters (transactions count, token transfers count, etc.)
   */
  async getAddressCounters(address: string): Promise<GetAddressCounterResponse> {
    const url = `${this.config.baseUrl}/api/v2/addresses/${address}/counters`;

    try {
      const response = await axios.get<GetAddressCounterResponse>(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`HTTP error! status: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get address transactions (single page)
   */
  async getAddressTransactions(address: string): Promise<BlockscoutTransaction[]> {
    const url = `${this.config.baseUrl}/api/v2/addresses/${address}/transactions`;

    try {
      const response = await axios.get<GetAddressTransactionsResponse>(url);
      return response.data.items;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`HTTP error! status: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get a single page of transactions
   */
  async getAddressTransactionsPage(address: string): Promise<GetAddressTransactionsResponse> {
    const url = `${this.config.baseUrl}/api/v2/addresses/${address}/transactions`;

    try {
      const response = await axios.get<GetAddressTransactionsResponse>(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`HTTP error! status: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get address token transfers (single page)
   */
  async getAddressTokenTransfers(
    address: string,
    filters?: TokenTransferFilters
  ): Promise<BlockscoutTokenTransfer[]> {
    const url = `${this.config.baseUrl}/api/v2/addresses/${address}/token-transfers`;

    try {
      const response = await axios.get<GetAddressTokenTransfersResponse>(url, {
        params: filters,
      });
      return response.data.items;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`HTTP error! status: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get a single page of token transfers
   */
  async getAddressTokenTransfersPage(
    address: string,
    filters?: TokenTransferFilters
  ): Promise<GetAddressTokenTransfersResponse> {
    const url = `${this.config.baseUrl}/api/v2/addresses/${address}/token-transfers`;

    try {
      const response = await axios.get<GetAddressTokenTransfersResponse>(url, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`HTTP error! status: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }
}

// Pre-configured instances for different networks
export const blockscoutServices = {
  ethereum: new BlockscoutService({
    baseUrl: 'https://eth.blockscout.com',
  }),
  optimism: new BlockscoutService({
    baseUrl: 'https://optimism.blockscout.com',
  }),
  base: new BlockscoutService({
    baseUrl: 'https://base.blockscout.com',
  }),
  ethereumSepolia: new BlockscoutService({
    baseUrl: 'https://eth-sepolia.blockscout.com',
  }),
};

// Default service (Ethereum mainnet)
export const blockscoutService = blockscoutServices.ethereum;
