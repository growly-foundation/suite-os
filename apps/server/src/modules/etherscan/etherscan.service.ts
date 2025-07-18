import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

export interface TokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export interface NFTTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  tokenID: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export interface ERC1155Transfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  tokenID: string;
  tokenValue: string;
  tokenName: string;
  tokenSymbol: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export interface AccountBalance {
  account: string;
  balance: string;
}

export interface EtherscanApiResponse<T> {
  status: string;
  message: string;
  result: T;
}

export interface ChainConfig {
  chainId: number;
  name: string;
  blockExplorerUrl: string;
}

interface ApiCallOptions {
  module: string;
  action: string;
  address?: string;
  contractaddress?: string;
  startblock?: number;
  endblock?: number;
  page?: number;
  offset?: number;
  sort?: 'asc' | 'desc';
  tag?: string;
  chainid: number;
  apikey: string;
}

@Injectable()
export class EtherscanService {
  private readonly logger = new Logger(EtherscanService.name);
  // Unified API endpoint for all chains
  private readonly apiUrl = 'https://api.etherscan.io/v2/api';
  private lastApiCall = 0;
  private readonly RATE_LIMIT_DELAY = 200; // 200ms between API calls

  constructor(private readonly configService: ConfigService) {}

  /**
   * Validate Ethereum address format
   */
  private isValidAddress(address: string): boolean {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
  }

  /**
   * Rate limiting to prevent API quota exceeded
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;

    if (timeSinceLastCall < this.RATE_LIMIT_DELAY) {
      const delay = this.RATE_LIMIT_DELAY - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastApiCall = Date.now();
  }

  /**
   * Generic API call method with error handling and rate limiting
   */
  private async makeApiCall<T>(options: ApiCallOptions, methodName: string): Promise<T> {
    const startTime = Date.now();

    // Enforce rate limiting
    await this.enforceRateLimit();

    try {
      const response: AxiosResponse<EtherscanApiResponse<T>> = await axios.get(this.apiUrl, {
        params: options,
      });

      const duration = Date.now() - startTime;
      this.logger.log(`API call completed in ${duration}ms for ${methodName}`);

      const data = response.data;

      if (data.status === '1') {
        return data.result;
      } else {
        this.logger.error(`Etherscan API error for ${methodName}: ${data.message || data.result}`);
        throw new Error(`Etherscan API error: ${data.message || data.result}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`API call failed after ${duration}ms for ${methodName}: ${error.message}`);

      if (axios.isAxiosError(error)) {
        throw new Error(`Network error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetch contract ABI using Etherscan API v2
   */
  async getContractABI(address: string, chainId = 1): Promise<any[]> {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }

    this.logger.log(`Fetching contract ABI for address: ${address}, chainId: ${chainId}`);

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.error(`API key not configured for ABI request`);
      throw new Error(`API key not configured`);
    }

    try {
      const result = await this.makeApiCall<string>(
        {
          chainid: chainId,
          module: 'contract',
          action: 'getabi',
          address,
          apikey: apiKey,
        },
        'getContractABI'
      );

      const parsedAbi = JSON.parse(result);
      this.logger.log(`Successfully parsed ABI with ${parsedAbi.length} functions for ${address}`);
      return parsedAbi;
    } catch (error) {
      if (
        error.message.includes('Network error') ||
        error.message.includes('Etherscan API error')
      ) {
        throw error;
      }
      this.logger.error(`Failed to parse ABI JSON for ${address}: ${error.message}`);
      throw new Error('Invalid ABI format received from Etherscan');
    }
  }

  /**
   * Fetch normal transactions for an address
   */
  async getTransactions(
    address: string,
    chainId = 1,
    options: {
      startBlock?: number;
      endBlock?: number;
      page?: number;
      offset?: number;
      sort?: 'asc' | 'desc';
    } = {}
  ): Promise<EtherscanTransaction[]> {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }

    const {
      startBlock = 0,
      endBlock = 99999999,
      page = 1,
      offset = 10000,
      sort = 'desc',
    } = options;

    this.logger.log(
      `Fetching transactions for address: ${address}, chainId: ${chainId}, page: ${page}, offset: ${offset}, sort: ${sort}`
    );

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.error(`API key not configured for transactions request`);
      throw new Error(`API key not configured`);
    }

    const result = await this.makeApiCall<EtherscanTransaction[]>(
      {
        chainid: chainId,
        module: 'account',
        action: 'txlist',
        address,
        startblock: startBlock,
        endblock: endBlock,
        page,
        offset,
        sort,
        apikey: apiKey,
      },
      'getTransactions'
    );

    this.logger.log(`Successfully fetched ${result.length} transactions for ${address}`);
    return result;
  }

  /**
   * Fetch internal transactions for an address
   */
  async getInternalTransactions(
    address: string,
    chainId = 1,
    options: {
      startBlock?: number;
      endBlock?: number;
      page?: number;
      offset?: number;
      sort?: 'asc' | 'desc';
    } = {}
  ): Promise<EtherscanTransaction[]> {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }

    const {
      startBlock = 0,
      endBlock = 99999999,
      page = 1,
      offset = 10000,
      sort = 'desc',
    } = options;

    this.logger.log(
      `Fetching internal transactions for address: ${address}, chainId: ${chainId}, page: ${page}, offset: ${offset}`
    );

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.error(`API key not configured for internal transactions request`);
      throw new Error(`API key not configured`);
    }

    const result = await this.makeApiCall<EtherscanTransaction[]>(
      {
        chainid: chainId,
        module: 'account',
        action: 'txlistinternal',
        address,
        startblock: startBlock,
        endblock: endBlock,
        page,
        offset,
        sort,
        apikey: apiKey,
      },
      'getInternalTransactions'
    );

    this.logger.log(`Successfully fetched ${result.length} internal transactions for ${address}`);
    return result;
  }

  /**
   * Fetch ERC20 token transfer events for an address
   */
  async getTokenTransfers(
    address: string,
    chainId = 1,
    options: {
      contractAddress?: string;
      startBlock?: number;
      endBlock?: number;
      page?: number;
      offset?: number;
      sort?: 'asc' | 'desc';
    } = {}
  ): Promise<TokenTransfer[]> {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }

    const {
      contractAddress,
      startBlock = 0,
      endBlock = 99999999,
      page = 1,
      offset = 10000,
      sort = 'desc',
    } = options;

    if (contractAddress && !this.isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    this.logger.log(
      `Fetching token transfers for address: ${address}, chainId: ${chainId}, contractAddress: ${contractAddress || 'all'}, page: ${page}, offset: ${offset}`
    );

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.error(`API key not configured for token transfers request`);
      throw new Error(`API key not configured`);
    }

    const params: ApiCallOptions = {
      chainid: chainId,
      module: 'account',
      action: 'tokentx',
      address,
      startblock: startBlock,
      endblock: endBlock,
      page,
      offset,
      sort,
      apikey: apiKey,
    };

    if (contractAddress) {
      params.contractaddress = contractAddress;
    }

    const result = await this.makeApiCall<TokenTransfer[]>(params, 'getTokenTransfers');

    this.logger.log(`Successfully fetched ${result.length} token transfers for ${address}`);
    return result;
  }

  /**
   * Fetch ERC721 (NFT) token transfer events for an address
   */
  async getNFTTransfers(
    address: string,
    chainId = 1,
    options: {
      contractAddress?: string;
      startBlock?: number;
      endBlock?: number;
      page?: number;
      offset?: number;
      sort?: 'asc' | 'desc';
    } = {}
  ): Promise<NFTTransfer[]> {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }

    const {
      contractAddress,
      startBlock = 0,
      endBlock = 99999999,
      page = 1,
      offset = 10000,
      sort = 'desc',
    } = options;

    if (contractAddress && !this.isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    this.logger.log(
      `Fetching NFT transfers for address: ${address}, chainId: ${chainId}, contractAddress: ${contractAddress || 'all'}, page: ${page}, offset: ${offset}`
    );

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.error(`API key not configured for NFT transfers request`);
      throw new Error(`API key not configured`);
    }

    const params: ApiCallOptions = {
      chainid: chainId,
      module: 'account',
      action: 'tokennfttx',
      address,
      startblock: startBlock,
      endblock: endBlock,
      page,
      offset,
      sort,
      apikey: apiKey,
    };

    if (contractAddress) {
      params.contractaddress = contractAddress;
    }

    const result = await this.makeApiCall<NFTTransfer[]>(params, 'getNFTTransfers');

    this.logger.log(`Successfully fetched ${result.length} NFT transfers for ${address}`);
    return result;
  }

  /**
   * Fetch ERC1155 token transfer events for an address
   */
  async getERC1155Transfers(
    address: string,
    chainId = 1,
    options: {
      contractAddress?: string;
      startBlock?: number;
      endBlock?: number;
      page?: number;
      offset?: number;
      sort?: 'asc' | 'desc';
    } = {}
  ): Promise<ERC1155Transfer[]> {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }

    const {
      contractAddress,
      startBlock = 0,
      endBlock = 99999999,
      page = 1,
      offset = 10000,
      sort = 'desc',
    } = options;

    if (contractAddress && !this.isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    this.logger.log(
      `Fetching ERC1155 transfers for address: ${address}, chainId: ${chainId}, contractAddress: ${contractAddress || 'all'}, page: ${page}, offset: ${offset}`
    );

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.error(`API key not configured for ERC1155 transfers request`);
      throw new Error(`API key not configured`);
    }

    const params: ApiCallOptions = {
      chainid: chainId,
      module: 'account',
      action: 'token1155tx',
      address,
      startblock: startBlock,
      endblock: endBlock,
      page,
      offset,
      sort,
      apikey: apiKey,
    };

    if (contractAddress) {
      params.contractaddress = contractAddress;
    }

    const result = await this.makeApiCall<ERC1155Transfer[]>(params, 'getERC1155Transfers');

    this.logger.log(`Successfully fetched ${result.length} ERC1155 transfers for ${address}`);
    return result;
  }

  /**
   * Get account balance for a single address
   */
  async getBalance(address: string, chainId = 1): Promise<string> {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }

    this.logger.log(`Fetching balance for address: ${address}, chainId: ${chainId}`);

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.error(`API key not configured for balance request`);
      throw new Error(`API key not configured`);
    }

    const result = await this.makeApiCall<string>(
      {
        chainid: chainId,
        module: 'account',
        action: 'balance',
        address,
        tag: 'latest',
        apikey: apiKey,
      },
      'getBalance'
    );

    this.logger.log(`Successfully fetched balance for ${address}: ${result} wei`);
    return result;
  }

  /**
   * Get account balances for multiple addresses
   */
  async getMultipleBalances(addresses: string[], chainId = 1): Promise<AccountBalance[]> {
    // Validate all addresses
    for (const address of addresses) {
      if (!this.isValidAddress(address)) {
        throw new Error(`Invalid Ethereum address: ${address}`);
      }
    }

    this.logger.log(`Fetching balances for ${addresses.length} addresses, chainId: ${chainId}`);

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.error(`API key not configured for multiple balances request`);
      throw new Error(`API key not configured`);
    }

    if (addresses.length > 20) {
      this.logger.error(`Too many addresses requested: ${addresses.length}, maximum is 20`);
      throw new Error('Maximum 20 addresses allowed per request');
    }

    const result = await this.makeApiCall<AccountBalance[]>(
      {
        chainid: chainId,
        module: 'account',
        action: 'balancemulti',
        address: addresses.join(','),
        tag: 'latest',
        apikey: apiKey,
      },
      'getMultipleBalances'
    );

    this.logger.log(`Successfully fetched balances for ${result.length} addresses`);
    return result;
  }

  /**
   * Get the single unified API key for all chains
   */
  private getApiKey(): string | undefined {
    return this.configService.get<string>('ETHERSCAN_API_KEY');
  }
}
