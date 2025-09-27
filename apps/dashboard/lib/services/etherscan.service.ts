/**
 * Etherscan API Service
 * Comprehensive service for interacting with Etherscan APIs across multiple chains
 */
import { AxiosError } from 'axios';

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
import { BaseHttpService, RetryConfig, exponentialBackoff } from './base-http.service';

export class EtherscanService extends BaseHttpService {
  private config: EtherscanConfig;
  private rateLimitDelay = 200; // legacy per-request guard (kept)
  private lastCallTime = 0;

  constructor(config: EtherscanConfig) {
    super({
      baseURL: 'https://api.etherscan.io/v2/api',
      timeout: config.timeout || 10000,
      headers: { 'Content-Type': 'application/json' },
    });
    this.config = config;

    this.client.interceptors.request.use(async cfg => {
      await this.enforceRateLimit();
      return cfg;
    });

    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        console.error('Etherscan API Error:', error.response?.data || error.message);
        throw this.handleApiError(error);
      }
    );
  }

  private get retryConfig(): RetryConfig {
    return {
      maxRetries: 5,
      shouldRetry: error => {
        // Check if it's a rate limit error from our custom method
        return error?.message === 'Etherscan rate limited';
      },
      getRetryDelay: retryCount => exponentialBackoff(retryCount, 2000),
      onRetry: (retryCount, maxRetries, endpoint) => {
        console.warn(
          `Etherscan rate limit. Retrying ${retryCount}/${maxRetries}${endpoint ? ` ${endpoint}` : ''}`
        );
      },
    };
  }

  /**
   * Custom request method that inspects Etherscan responses for rate limit messages
   */
  private async requestWithEtherscanRetry<T>(
    endpoint: string,
    config: any,
    retryConfig: RetryConfig
  ): Promise<T> {
    let retries = 0;

    while (true) {
      try {
        const response = await this.client.request<T>({ url: endpoint, ...config });
        const data = (response as any).data ?? response;

        // Check if the response contains rate limit information
        if (typeof data?.result === 'string' && data.result.toLowerCase().includes('rate limit')) {
          // console.log('Etherscan rate limit detected in result:', data.result);

          // Throw a retryable error
          const rateLimitError = new Error('Etherscan rate limited');
          throw rateLimitError;
        }

        return data as T;
      } catch (error: any) {
        const shouldRetry = retryConfig.shouldRetry(error);

        if (shouldRetry && retries < retryConfig.maxRetries) {
          retries += 1;
          retryConfig.onRetry?.(retries, retryConfig.maxRetries, endpoint);
          const delay = retryConfig.getRetryDelay(retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }
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

    if ((error as any).code === 'ECONNABORTED') {
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
      const response = await this.requestWithEtherscanRetry<EtherscanNormalTransactionsResponse>(
        '',
        {
          method: 'GET',
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
        },
        this.retryConfig
      );

      if (response.status !== '1') {
        throw new Error(`API Error: ${response.message}`);
      }

      return response.result || [];
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
      const response = await this.requestWithEtherscanRetry<EtherscanTokenTransfersResponse>(
        '',
        {
          method: 'GET',
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
        },
        this.retryConfig
      );

      if (response.status !== '1') {
        throw new Error(`API Error: ${response.message}`);
      }

      return response.result || [];
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
      const response = await this.requestWithEtherscanRetry<EtherscanTokenTransfersResponse>(
        '',
        {
          method: 'GET',
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
        },
        this.retryConfig
      );

      if (response.status !== '1') {
        throw new Error(`API Error: ${response.message}`);
      }

      return response.result || [];
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
      const response = await this.requestWithEtherscanRetry<EtherscanTokenTransfersResponse>(
        '',
        {
          method: 'GET',
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
        },
        this.retryConfig
      );

      if (response.status !== '1') {
        throw new Error(`API Error: ${response.message}`);
      }

      return response.result || [];
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
      const response = await this.requestWithEtherscanRetry<EtherscanFundingResponse>(
        '',
        {
          method: 'GET',
          params: {
            module: 'account',
            action: 'fundedby',
            address: params.address,
            chainId: params.chainId,
            apikey: this.config.apiKey,
          },
        },
        this.retryConfig
      );

      return response.result;
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

export const getEtherscanService = (apiKey: string): EtherscanService => {
  return new EtherscanService({ apiKey });
};
