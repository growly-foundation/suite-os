/**
 * Etherscan API Service
 * Comprehensive service for interacting with Etherscan APIs across multiple chains
 */
import axios, { AxiosError, AxiosInstance } from 'axios';

import {
  EtherscanConfig,
  EtherscanFundingInfo,
  EtherscanFundingParams,
  EtherscanFundingResponse,
  EtherscanNormalTransactionsResponse,
  EtherscanTokenTransfer,
  EtherscanTokenTransferParams,
  EtherscanTokenTransfersResponse,
  EtherscanTransaction,
  EtherscanTransactionParams,
} from '../../types/etherscan';

export class EtherscanService {
  private client: AxiosInstance;
  private config: EtherscanConfig;
  private rateLimitDelay = 200; // 5 calls per second default
  private lastCallTime = 0;

  constructor(config: EtherscanConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: 'https://api.etherscan.io/v2/api',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async config => {
      await this.enforceRateLimit();
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        console.error('Etherscan API Error:', error.response?.data || error.message);
        throw this.handleApiError(error);
      }
    );
  }

  /**
   * Enforce rate limiting (5 calls per second for free tier)
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    if (timeSinceLastCall < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastCallTime = Date.now();
  }

  /**
   * Handle API errors with proper typing
   */
  private handleApiError(error: AxiosError): Error {
    const response = error.response?.data as any;

    if (response?.message) {
      return new Error(`Etherscan API Error: ${response.message}`);
    }

    if (error.code === 'ECONNABORTED') {
      return new Error('Etherscan API timeout');
    }

    return new Error(`Etherscan API Error: ${error.message}`);
  }

  /**
   * Get normal transactions for an address
   * GET /api?module=account&action=txlist
   */
  async getNormalTransactions(params: EtherscanTransactionParams): Promise<EtherscanTransaction[]> {
    try {
      const response = await this.client.get<EtherscanNormalTransactionsResponse>('', {
        params: {
          module: 'account',
          action: 'txlist',
          address: params.address,
          chainId: params.chainId,
          startblock: params.startblock || 0,
          endblock: params.endblock || 99999999,
          page: params.page || 1,
          offset: params.offset || 10000,
          sort: params.sort || 'desc',
          apikey: this.config.apiKey,
        },
      });

      if (response.data.status !== '1') {
        throw new Error(`API Error: ${response.data.message}`);
      }

      return response.data.result || [];
    } catch (error: any) {
      console.error(`Failed to get normal transactions for ${params.address}:`, error.message);
      throw error;
    }
  }

  /**
   * Get ERC20 token transfers for an address
   * GET /api?module=account&action=tokentx
   */
  async getERC20Transfers(params: EtherscanTokenTransferParams): Promise<EtherscanTokenTransfer[]> {
    try {
      const response = await this.client.get<EtherscanTokenTransfersResponse>('', {
        params: {
          module: 'account',
          action: 'tokentx',
          address: params.address,
          chainId: params.chainId,
          contractaddress: params.contractaddress,
          startblock: params.startblock || 0,
          endblock: params.endblock || 99999999,
          page: params.page || 1,
          offset: params.offset || 10000,
          sort: params.sort || 'desc',
          apikey: this.config.apiKey,
        },
      });

      if (response.data.status !== '1') {
        throw new Error(`API Error: ${response.data.message}`);
      }

      return response.data.result || [];
    } catch (error: any) {
      console.error(`Failed to get ERC20 transfers for ${params.address}:`, error.message);
      throw error;
    }
  }

  /**
   * Get ERC721 token transfers for an address
   * GET /api?module=account&action=tokennfttx
   */
  async getERC721Transfers(
    params: EtherscanTokenTransferParams
  ): Promise<EtherscanTokenTransfer[]> {
    try {
      const response = await this.client.get<EtherscanTokenTransfersResponse>('', {
        params: {
          module: 'account',
          action: 'tokennfttx',
          address: params.address,
          chainId: params.chainId,
          contractaddress: params.contractaddress,
          startblock: params.startblock || 0,
          endblock: params.endblock || 99999999,
          page: params.page || 1,
          offset: params.offset || 10000,
          sort: params.sort || 'desc',
          apikey: this.config.apiKey,
        },
      });

      if (response.data.status !== '1') {
        throw new Error(`API Error: ${response.data.message}`);
      }

      return response.data.result || [];
    } catch (error: any) {
      console.error(`Failed to get ERC721 transfers for ${params.address}:`, error.message);
      throw error;
    }
  }

  /**
   * Get ERC1155 token transfers for an address
   * GET /api?module=account&action=token1155tx
   */
  async getERC1155Transfers(
    params: EtherscanTokenTransferParams
  ): Promise<EtherscanTokenTransfer[]> {
    try {
      const response = await this.client.get<EtherscanTokenTransfersResponse>('', {
        params: {
          module: 'account',
          action: 'token1155tx',
          address: params.address,
          chainId: params.chainId,
          contractaddress: params.contractaddress,
          startblock: params.startblock || 0,
          endblock: params.endblock || 99999999,
          page: params.page || 1,
          offset: params.offset || 10000,
          sort: params.sort || 'desc',
          apikey: this.config.apiKey,
        },
      });

      if (response.data.status !== '1') {
        throw new Error(`API Error: ${response.data.message}`);
      }

      return response.data.result || [];
    } catch (error: any) {
      console.error(`Failed to get ERC1155 transfers for ${params.address}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all token transfers (ERC20, ERC721, ERC1155) for an address
   */
  async getAllTokenTransfers(params: EtherscanTokenTransferParams): Promise<{
    erc20: EtherscanTokenTransfer[];
    erc721: EtherscanTokenTransfer[];
    erc1155: EtherscanTokenTransfer[];
  }> {
    try {
      const [erc20, erc721, erc1155] = await Promise.all([
        this.getERC20Transfers(params),
        this.getERC721Transfers(params),
        this.getERC1155Transfers(params),
      ]);

      return { erc20, erc721, erc1155 };
    } catch (error: any) {
      console.error(`Failed to get all token transfers for ${params.address}:`, error.message);
      throw error;
    }
  }

  /**
   * Get address funded by information
   * GET /api?module=account&action=fundedby
   */
  async getAddressFundedBy(params: EtherscanFundingParams): Promise<EtherscanFundingInfo | null> {
    try {
      const response = await this.client.get<EtherscanFundingResponse>('', {
        params: {
          module: 'account',
          action: 'fundedby',
          address: params.address,
          chainId: params.chainId,
          apikey: this.config.apiKey,
        },
      });

      if (response.data.status !== '1') {
        // Address might not have funding info
        return null;
      }

      return response.data.result;
    } catch (error: any) {
      console.error(`Failed to get funding info for ${params.address}:`, error.message);
      return null;
    }
  }

  /**
   * Get address funded by across multiple chains (sequential to respect rate limits)
   */
  async getAddressFundedByAcrossChains(
    address: string,
    chainIds: number[]
  ): Promise<Record<number, EtherscanFundingInfo | null>> {
    const results: Record<number, EtherscanFundingInfo | null> = {};
    for (const chainId of chainIds) {
      const info = await this.getAddressFundedBy({ address, chainId });
      results[chainId] = info;
    }
    return results;
  }
}

// Export singleton instance for Ethereum mainnet
export const getEtherscanService = (apiKey: string): EtherscanService => {
  return new EtherscanService({ apiKey });
};
