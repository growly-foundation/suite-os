import axios from 'axios';

import type {
  ZerionBalanceChart,
  ZerionBalanceChartResponse,
  ZerionFungiblePosition,
  ZerionFungiblePositionsResponse,
  ZerionNftCollection,
  ZerionNftCollectionsResponse,
  ZerionNftParams,
  ZerionNftPortfolio,
  ZerionNftPortfolioResponse,
  ZerionNftPosition,
  ZerionNftPositionsResponse,
  ZerionPnL,
  ZerionPnLParams,
  ZerionPnLResponse,
  ZerionPortfolio,
  ZerionPortfolioParams,
  ZerionPortfolioResponse,
  ZerionPositionParams,
  ZerionTransaction,
  ZerionTransactionParams,
  ZerionTransactionsResponse,
  ZerionWalletParams,
} from '../../types/zerion';
import { BaseHttpService, RetryConfig, exponentialBackoff } from './base-http.service';

export class ZerionService extends BaseHttpService {
  private readonly baseURL = 'https://api.zerion.io/v1';

  constructor(apiKey: string) {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      const encodedKey = Buffer.from(`${apiKey}:`).toString('base64');
      headers['Authorization'] = `Basic ${encodedKey}`;
    }

    super({ baseURL: 'https://api.zerion.io/v1', headers, timeout: 30000 });
  }

  private get rateLimitRetryConfig(): RetryConfig {
    return {
      maxRetries: 5,
      shouldRetry: error => axios.isAxiosError(error) && error.response?.status === 429,
      getRetryDelay: retryCount => exponentialBackoff(retryCount, 1000),
      onRetry: (retryCount, maxRetries, endpoint) => {
        console.warn(
          `Zerion API rate limit (429). Retrying ${retryCount}/${maxRetries} for ${endpoint || ''}`
        );
      },
    };
  }

  private async fetchAllPages<TData, TResponse extends { links: { next?: string }; data: TData[] }>(
    initialPath: string,
    params: Record<string, any> | undefined,
    pageLimit?: number
  ): Promise<TData[]> {
    const collected: TData[] = [];
    let nextPath: string | undefined = initialPath;
    let pages = 0;

    while (nextPath) {
      const response: TResponse = await this.requestWithRetry<TResponse>(
        nextPath,
        { method: 'GET', params },
        this.rateLimitRetryConfig
      );
      collected.push(...response.data);
      nextPath = response.links?.next;
      params = undefined; // use absolute next URL, params no longer apply
      pages += 1;
      if (pageLimit && pages >= pageLimit) break;

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return collected;
  }

  /**
   * Fetch all pages of transactions with deduplication
   * Uses hash + chain_id as unique key to prevent duplicates across pages
   */
  private async fetchAllTransactionsWithDedup(
    initialPath: string,
    params: Record<string, any> | undefined,
    pageLimit?: number
  ): Promise<ZerionTransaction[]> {
    const seenTransactions = new Set<string>();
    const collected: ZerionTransaction[] = [];
    let nextPath: string | undefined = initialPath;
    let pages = 0;

    while (nextPath) {
      const response: ZerionTransactionsResponse =
        await this.requestWithRetry<ZerionTransactionsResponse>(
          nextPath,
          { method: 'GET', params },
          this.rateLimitRetryConfig
        );

      for (const tx of response.data) {
        const hash = tx.attributes?.hash;
        const chainId = tx.relationships?.chain?.data?.id;
        if (!hash) continue;
        const uniqueKey = `${hash}-${chainId || 'unknown'}`;
        if (!seenTransactions.has(uniqueKey)) {
          seenTransactions.add(uniqueKey);
          collected.push(tx);
        }
      }

      nextPath = response.links?.next;
      params = undefined; // use absolute next URL, params no longer apply
      pages += 1;
      if (pageLimit && pages >= pageLimit) break;

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return collected;
  }
  /**
   * Get wallet's balance chart
   * GET /wallets/{address}/balance-chart/
   */
  async getBalanceChart(address: string, params?: ZerionWalletParams): Promise<ZerionBalanceChart> {
    try {
      const data = await this.requestWithRetry<ZerionBalanceChartResponse>(
        `/wallets/${address}/balance-chart/`,
        { method: 'GET', params },
        this.rateLimitRetryConfig
      );
      return data.data;
    } catch (error: any) {
      console.error(`Failed to get balance chart for ${address}:`, error?.message || error);
      throw error;
    }
  }

  /**
   * Get wallet's portfolio
   * GET /wallets/{address}/portfolio/
   */
  async getPortfolio(address: string, params?: ZerionPortfolioParams): Promise<ZerionPortfolio> {
    try {
      const data = await this.requestWithRetry<ZerionPortfolioResponse>(
        `/wallets/${address}/portfolio/`,
        { method: 'GET', params },
        this.rateLimitRetryConfig
      );
      return data.data;
    } catch (error: any) {
      console.error(`Failed to get portfolio for ${address}:`, error?.message || error);
      throw error;
    }
  }

  /**
   * Get list of wallet's fungible positions
   * GET /wallets/{address}/positions/
   */
  async getFungiblePositions(
    address: string,
    params?: ZerionPositionParams
  ): Promise<ZerionFungiblePosition[]> {
    try {
      const data = await this.requestWithRetry<ZerionFungiblePositionsResponse>(
        `/wallets/${address}/positions/`,
        { method: 'GET', params },
        this.rateLimitRetryConfig
      );
      return data.data;
    } catch (error: any) {
      console.error(`Failed to get fungible positions for ${address}:`, error?.message || error);
      throw error;
    }
  }

  async getAllFungiblePositions(
    address: string,
    params?: ZerionPositionParams,
    pageLimit?: number
  ): Promise<ZerionFungiblePosition[]> {
    return this.fetchAllPages<ZerionFungiblePosition, ZerionFungiblePositionsResponse>(
      `/wallets/${address}/positions/`,
      params,
      pageLimit
    );
  }

  /**
   * Get list of wallet's transactions
   * GET /wallets/{address}/transactions/
   */
  async getTransactions(
    address: string,
    params?: ZerionTransactionParams
  ): Promise<ZerionTransaction[]> {
    try {
      const data = await this.requestWithRetry<ZerionTransactionsResponse>(
        `/wallets/${address}/transactions/`,
        { method: 'GET', params },
        this.rateLimitRetryConfig
      );
      return data.data;
    } catch (error: any) {
      console.error(`Failed to get transactions for ${address}:`, error?.message || error);
      throw error;
    }
  }

  async getAllTransactions(
    address: string,
    params?: ZerionTransactionParams,
    pageLimit?: number
  ): Promise<ZerionTransaction[]> {
    return this.fetchAllTransactionsWithDedup(
      `/wallets/${address}/transactions/`,
      params,
      pageLimit
    );
  }
  /**
   * Get a list of a wallet's NFT positions
   * GET /wallets/{address}/nft-positions/
   */
  async getNftPositions(address: string, params?: ZerionNftParams): Promise<ZerionNftPosition[]> {
    try {
      const data = await this.requestWithRetry<ZerionNftPositionsResponse>(
        `/wallets/${address}/nft-positions/`,
        { method: 'GET', params },
        this.rateLimitRetryConfig
      );
      return data.data;
    } catch (error: any) {
      console.error(`Failed to get NFT positions for ${address}:`, error?.message || error);
      throw error;
    }
  }

  async getAllNftPositions(
    address: string,
    params?: ZerionNftParams,
    pageLimit?: number
  ): Promise<ZerionNftPosition[]> {
    return this.fetchAllPages<ZerionNftPosition, ZerionNftPositionsResponse>(
      `/wallets/${address}/nft-positions/`,
      params,
      pageLimit
    );
  }

  /**
   * Get a list of NFT collections held by a wallet
   * GET /wallets/{address}/nft-collections/
   */
  async getNftCollections(
    address: string,
    params?: ZerionNftParams
  ): Promise<ZerionNftCollection[]> {
    try {
      const data = await this.requestWithRetry<ZerionNftCollectionsResponse>(
        `/wallets/${address}/nft-collections/`,
        { method: 'GET', params },
        this.rateLimitRetryConfig
      );
      return data.data;
    } catch (error: any) {
      console.error(`Failed to get NFT collections for ${address}:`, error?.message || error);
      throw error;
    }
  }

  async getAllNftCollections(
    address: string,
    params?: ZerionNftParams,
    pageLimit?: number
  ): Promise<ZerionNftCollection[]> {
    return this.fetchAllPages<ZerionNftCollection, ZerionNftCollectionsResponse>(
      `/wallets/${address}/nft-collections/`,
      params,
      pageLimit
    );
  }

  /**
   * Get wallet's NFT portfolio
   * GET /wallets/{address}/nft-portfolio/
   */
  async getNftPortfolio(address: string, params?: ZerionNftParams): Promise<ZerionNftPortfolio> {
    try {
      const data = await this.requestWithRetry<ZerionNftPortfolioResponse>(
        `/wallets/${address}/nft-portfolio/`,
        { method: 'GET', params },
        this.rateLimitRetryConfig
      );
      return data.data;
    } catch (error: any) {
      console.error(`Failed to get NFT portfolio for ${address}:`, error?.message || error);
      throw error;
    }
  }

  /**
   * Get wallet's PnL
   * GET /wallets/{address}/pnl/
   */
  async getPnL(address: string, params?: ZerionPnLParams): Promise<ZerionPnL> {
    try {
      const data = await this.requestWithRetry<ZerionPnLResponse>(
        `/wallets/${address}/pnl/`,
        { method: 'GET', params },
        this.rateLimitRetryConfig
      );
      return data.data;
    } catch (error: any) {
      console.error(`Failed to get PnL for ${address}:`, error?.message || error);
      throw error;
    }
  }

  /**
   * Helper method to get all wallet data in one call
   */
  async getAllWalletData(
    address: string,
    options?: {
      includeBalanceChart?: boolean;
      includePortfolio?: boolean;
      includePositions?: boolean;
      includeTransactions?: boolean;
      includeNftPositions?: boolean;
      includeNftCollections?: boolean;
      includeNftPortfolio?: boolean;
      includePnL?: boolean;
    }
  ) {
    const {
      includeBalanceChart = true,
      includePortfolio = true,
      includePositions = true,
      includeTransactions = true,
      includeNftPositions = true,
      includeNftCollections = true,
      includeNftPortfolio = true,
      includePnL = true,
    } = options || {};

    const promises: Promise<any>[] = [];

    if (includeBalanceChart) {
      promises.push(this.getBalanceChart(address));
    }
    if (includePortfolio) {
      promises.push(this.getPortfolio(address));
    }
    if (includePositions) {
      promises.push(this.getFungiblePositions(address));
    }
    if (includeTransactions) {
      promises.push(this.getTransactions(address));
    }
    if (includeNftPositions) {
      promises.push(this.getNftPositions(address));
    }
    if (includeNftCollections) {
      promises.push(this.getNftCollections(address));
    }
    if (includeNftPortfolio) {
      promises.push(this.getNftPortfolio(address));
    }
    if (includePnL) {
      promises.push(this.getPnL(address));
    }

    try {
      const results = await Promise.allSettled(promises);

      return {
        balanceChart: includeBalanceChart ? results[0] : null,
        portfolio: includePortfolio ? results[1] : null,
        positions: includePositions ? results[2] : null,
        transactions: includeTransactions ? results[3] : null,
        nftPositions: includeNftPositions ? results[4] : null,
        nftCollections: includeNftCollections ? results[5] : null,
        nftPortfolio: includeNftPortfolio ? results[6] : null,
        pnl: includePnL ? results[7] : null,
      };
    } catch (error: any) {
      console.error(`Failed to get all wallet data for ${address}:`, error?.message || error);
      throw error;
    }
  }
}
