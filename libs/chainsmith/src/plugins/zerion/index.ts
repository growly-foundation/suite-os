import axios, { AxiosInstance } from 'axios';
import { Logger } from 'tslog';

import type {
  TAddress,
  TChain,
  TChainName,
  TMarketNft,
  TMarketNftList,
  TMarketToken,
  TMarketTokenList,
  TMultichain,
  TNftPortfolio,
  TTokenPortfolioStats,
} from '../../types';
import {
  aggregateMultichainTokenBalance,
  calculateMultichainTokenPortfolio,
  getChainIdByName,
} from '../../utils';
import { ZerionFungiblePositionsResponse, ZerionNftPositionsResponse } from './types';

export class ZerionPortfolioPlugin {
  logger = new Logger({ name: 'ZerionPortfolioPlugin' });

  client: AxiosInstance;

  constructor(baseURL: string, apiKey: string) {
    this.client = this.getZerionAxiosInstance(apiKey, baseURL);
  }

  getEncodedKey(apiKey: string): string {
    if (!apiKey) {
      throw new Error('ZERION_API_KEY is not configured.');
    }
    return Buffer.from(`${apiKey}:`).toString('base64');
  }

  getZerionAxiosInstance = (apiKey: string, baseURL: string) => {
    let headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (apiKey) {
      headers = {
        ...headers,
        Authorization: `Basic ${this.getEncodedKey(apiKey)}`,
      };
    }
    return axios.create({
      baseURL,
      headers,
    });
  };

  getMultichainTokenPortfolio = async (
    walletAddress: TAddress,
    chains?: TChain[]
  ): Promise<TTokenPortfolioStats> => {
    try {
      const response = await this.client.get<ZerionFungiblePositionsResponse>(
        `/wallets/${walletAddress}/positions/`,
        {
          params: {
            'filter[positions]': 'no_filter',
            currency: 'usd',
            'filter[chain_ids]': chains
              ?.map(chain =>
                chain.name.toLowerCase() === 'op mainnet' ? 'optimism' : chain.name.toLowerCase()
              )
              .join(','),
            'filter[trash]': 'only_non_trash',
            sort: 'value',
          },
        }
      );

      const { data } = response.data;

      // Convert Zerion data to multichain token list format
      const multichainTokenList: TMultichain<TMarketTokenList> = {};

      // Group positions by chain
      for (const position of data) {
        const { attributes, relationships } = position;
        const { value, fungible_info, quantity, price } = attributes;
        const zerionChainId = relationships.chain.data.id;
        const chainName = zerionChainId === 'ethereum' ? 'mainnet' : zerionChainId;

        // Skip positions with no value
        if (!value || value <= 0) continue;

        // Initialize chain entry if it doesn't exist
        if (!multichainTokenList[chainName]) {
          multichainTokenList[chainName] = {
            totalUsdValue: 0,
            tokens: [],
          };
        }

        // Get token address from implementations
        let tokenAddress: string | null = null;
        const implementation = fungible_info.implementations?.find(
          impl => impl.chain_id === zerionChainId
        );
        if (implementation?.address) {
          tokenAddress = implementation.address;
        }

        // Create market token
        const baseToken = {
          chainId: getChainIdByName(chainName as TChainName),
          name: fungible_info.name,
          symbol: fungible_info.symbol,
          decimals: implementation?.decimals || 18,
          logoURI: fungible_info.icon?.url,
          balance: quantity?.float || 0,
          usdValue: value,
          marketPrice: price || 0,
          tags: [],
        };

        let marketToken: TMarketToken;

        if (tokenAddress && tokenAddress.startsWith('0x')) {
          marketToken = {
            ...baseToken,
            address: tokenAddress as `0x${string}`,
            type: undefined,
          };
        } else {
          marketToken = {
            ...baseToken,
            type: 'native',
          };
        }

        multichainTokenList[chainName].tokens.push(marketToken);
        multichainTokenList[chainName].totalUsdValue += value;
      }

      // Use the existing aggregation utility to convert to TTokenPortfolio
      return calculateMultichainTokenPortfolio(
        aggregateMultichainTokenBalance(multichainTokenList)
      );
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Failed to get multichain token portfolio: ${error.response?.data || error.message}`
        );
      } else {
        this.logger.error(`Failed to get multichain token portfolio: ${error}`);
      }
      throw new Error(error);
    }
  };

  getMultichainNftPortfolio = async (
    walletAddress: TAddress,
    chains?: TChain[]
  ): Promise<TNftPortfolio> => {
    try {
      const response = await this.client.get<ZerionNftPositionsResponse>(
        `/wallets/${walletAddress}/nft-collections`,
        {
          params: {
            'filter[chain_ids]': chains
              ?.map(chain =>
                chain.name.toLowerCase() === 'op mainnet' ? 'optimism' : chain.name.toLowerCase()
              )
              .join(','),
            currency: 'usd',
            sort: '-total_floor_price',
          },
        }
      );
      const { data } = response.data;

      // Convert Zerion NFT data to multichain NFT list format
      const multichainNftList: TMultichain<TMarketNftList> = {};
      let totalPortfolioValue = 0;
      let mostValuableCollection: TMarketNft | undefined;

      // Group NFT positions by chain
      for (const position of data) {
        const { attributes, relationships } = position;
        const { total_floor_price, nfts_count, collection_info } = attributes;

        // Skip collections with no value
        if (!total_floor_price || total_floor_price <= 0) continue;

        // Extract chain information - assuming the first chain if multiple exist
        // For now, we'll extract chain from the collection ID or use a default approach
        const collectionId = relationships.nft_collection.data.id;
        const zerionChainId = relationships.chains.data[0].id;
        const chainName = zerionChainId === 'ethereum' ? 'mainnet' : zerionChainId;

        // Initialize chain entry if it doesn't exist
        if (!multichainNftList[chainName]) {
          multichainNftList[chainName] = {
            totalUsdValue: 0,
            nfts: [],
          };
        }

        // Create market NFT
        const marketNft: TMarketNft = {
          chainId: getChainIdByName(chainName as TChainName),
          address: collectionId.split(':')[1] || collectionId, // Extract address after colon
          name: collection_info.name,
          image: collection_info.content?.icon?.url || '',
          floorPrice: total_floor_price,
          currency: 'USD',
          balance: parseInt(nfts_count) || 0,
          usdValue: total_floor_price,
        };

        // Track most valuable collection
        if (!mostValuableCollection || marketNft.usdValue > mostValuableCollection.usdValue) {
          mostValuableCollection = marketNft;
        }

        multichainNftList[chainName]!.nfts.push(marketNft);
        multichainNftList[chainName]!.totalUsdValue += total_floor_price;
        totalPortfolioValue += total_floor_price;
      }

      return {
        totalUsdValue: totalPortfolioValue,
        mostValuableNFTCollection: mostValuableCollection,
        chainRecordsWithNfts: multichainNftList,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get multichain NFT portfolio: ${error}`);
      throw new Error(error);
    }
  };
}
