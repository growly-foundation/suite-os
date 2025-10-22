import axios, { AxiosInstance } from 'axios';

import type {
  AlchemyNftContractsByAddressRequest,
  AlchemyNftContractsByAddressResponse,
  AlchemyNftsByAddressRequest,
  AlchemyNftsByAddressResponse,
  AlchemyTokenBalancesByAddressRequest,
  AlchemyTokenBalancesByAddressResponse,
  AlchemyTokensByAddressRequest,
  AlchemyTokensByAddressResponse,
} from '../../types/alchemy';

export class AlchemyPortfolioService {
  private client: AxiosInstance;
  private readonly baseURL = 'https://api.g.alchemy.com/data/v1';

  constructor(private apiKey: string) {
    this.client = axios.create({
      baseURL: `${this.baseURL}/${apiKey}`,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      timeout: 30000,
    });
  }

  private async fetchAllWithPageKey<
    TReq extends { pageKey?: string },
    TRes extends { data: { pageKey?: string } },
  >(path: string, payload: TReq, pageLimit?: number): Promise<TRes[]> {
    const pages: TRes[] = [];
    let currentPayload: TReq = { ...payload } as TReq;
    let count = 0;

    while (true) {
      const res = await this.client.post<TRes>(path, currentPayload);
      if (!res.data) {
        console.error('Alchemy API response missing data:', res);
        break;
      }
      pages.push(res.data);
      const next = res.data?.data?.pageKey;
      count += 1;
      if (!next) break;
      if (pageLimit && count >= pageLimit) break;
      currentPayload = { ...(currentPayload as any), pageKey: next };
    }

    return pages;
  }

  // Tokens By Wallet (metadata + prices)
  async getTokensByAddress(
    payload: AlchemyTokensByAddressRequest
  ): Promise<AlchemyTokensByAddressResponse> {
    try {
      const res = await this.client.post<AlchemyTokensByAddressResponse>(
        '/assets/tokens/by-address',
        payload
      );
      if (!res.data) {
        throw new Error('Alchemy API response missing data');
      }
      return res.data;
    } catch (error: any) {
      console.error('Failed to fetch tokens by address:', (error as any)?.message || error);
      throw error;
    }
  }

  async getAllTokensByAddress(payload: AlchemyTokensByAddressRequest, pageLimit?: number) {
    const pages = await this.fetchAllWithPageKey<
      AlchemyTokensByAddressRequest,
      AlchemyTokensByAddressResponse
    >('/assets/tokens/by-address', payload, pageLimit);
    const tokens = pages.flatMap(p => p.data.tokens);
    const last = pages[pages.length - 1];
    return { data: { tokens, pageKey: last?.data?.pageKey } } as AlchemyTokensByAddressResponse;
  }

  // Token Balances By Wallet (balances only)
  async getTokenBalancesByAddress(
    payload: AlchemyTokenBalancesByAddressRequest
  ): Promise<AlchemyTokenBalancesByAddressResponse> {
    try {
      const res = await this.client.post<AlchemyTokenBalancesByAddressResponse>(
        '/assets/tokens/balances/by-address',
        payload
      );
      if (!res.data) {
        throw new Error('Alchemy API response missing data');
      }
      return res.data;
    } catch (error: any) {
      console.error('Failed to fetch token balances by address:', (error as any)?.message || error);
      throw error;
    }
  }

  async getAllTokenBalancesByAddress(
    payload: AlchemyTokenBalancesByAddressRequest,
    pageLimit?: number
  ) {
    const pages = await this.fetchAllWithPageKey<
      AlchemyTokenBalancesByAddressRequest,
      AlchemyTokenBalancesByAddressResponse
    >('/assets/tokens/balances/by-address', payload, pageLimit);
    const tokens = pages.flatMap(p => p.data.tokens);
    const last = pages[pages.length - 1];
    return {
      data: { tokens, pageKey: last?.data?.pageKey },
    } as AlchemyTokenBalancesByAddressResponse;
  }

  // NFTs By Wallet
  async getNftsByAddress(
    payload: AlchemyNftsByAddressRequest
  ): Promise<AlchemyNftsByAddressResponse> {
    try {
      const res = await this.client.post<AlchemyNftsByAddressResponse>(
        '/assets/nfts/by-address',
        payload
      );
      if (!res.data) {
        throw new Error('Alchemy API response missing data');
      }
      return res.data;
    } catch (error: any) {
      console.error('Failed to fetch NFTs by address:', (error as any)?.message || error);
      throw error;
    }
  }

  async getAllNftsByAddress(payload: AlchemyNftsByAddressRequest, pageLimit?: number) {
    const pages = await this.fetchAllWithPageKey<
      AlchemyNftsByAddressRequest,
      AlchemyNftsByAddressResponse
    >('/assets/nfts/by-address', payload, pageLimit);
    const nfts = pages.flatMap(p => p.data.nfts);
    const last = pages[pages.length - 1];
    return {
      data: {
        nfts,
        pageKey: last?.data?.pageKey,
        totalCount: pages.reduce((a, p) => a + (p.data.nfts?.length || 0), 0),
      },
    } as AlchemyNftsByAddressResponse;
  }

  // NFT Contracts By Wallet
  async getNftContractsByAddress(
    payload: AlchemyNftContractsByAddressRequest
  ): Promise<AlchemyNftContractsByAddressResponse> {
    try {
      const res = await this.client.post<AlchemyNftContractsByAddressResponse>(
        '/assets/nft-contracts/by-address',
        payload
      );
      if (!res.data) {
        throw new Error('Alchemy API response missing data');
      }
      return res.data;
    } catch (error: any) {
      console.error('Failed to fetch NFT contracts by address:', (error as any)?.message || error);
      throw error;
    }
  }

  async getAllNftContractsByAddress(
    payload: AlchemyNftContractsByAddressRequest,
    pageLimit?: number
  ) {
    const pages = await this.fetchAllWithPageKey<
      AlchemyNftContractsByAddressRequest,
      AlchemyNftContractsByAddressResponse
    >('/assets/nft-contracts/by-address', payload, pageLimit);
    const contracts = pages.flatMap(p => p.data.contracts);
    const last = pages[pages.length - 1];
    return {
      data: { contracts, pageKey: last?.data?.pageKey },
    } as AlchemyNftContractsByAddressResponse;
  }
}
