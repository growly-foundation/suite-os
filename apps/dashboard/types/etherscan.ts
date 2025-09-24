/**
 * Etherscan API Types
 * Based on https://docs.etherscan.io/api-endpoints/accounts
 */

// Base API Response Structure
export interface EtherscanApiResponse<T = any> {
  status: string;
  message: string;
  result: T;
}

// Common Transaction Fields
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
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  contractAddress: string;
  confirmations: string;
}

// Normal Transactions Response
export interface EtherscanNormalTransactionsResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

// Token Transfer Events (ERC20, ERC721, ERC1155)
export interface EtherscanTokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  contractAddress: string;
  from: string;
  to: string;
  tokenID?: string; // For ERC721/ERC1155
  tokenName: string;
  tokenSymbol: string;
  tokenValue?: string; // For ERC20/ERC1155
  tokenDecimal?: string; // For ERC20
  confirmations: string;
}

// Token Transfer Response
export interface EtherscanTokenTransfersResponse {
  status: string;
  message: string;
  result: EtherscanTokenTransfer[];
}

// Address Funded By Response
export interface EtherscanFundingInfo {
  block: number;
  timeStamp: string;
  fundingAddress: string;
  fundingTxn: string;
  value: string;
}

export interface EtherscanFundingResponse {
  status: string;
  message: string;
  result: EtherscanFundingInfo;
}

// Request Parameters
export interface EtherscanTransactionParams {
  address: string;
  chainId: number;
  startblock?: number;
  endblock?: number;
  page?: number;
  offset?: number;
  sort?: 'asc' | 'desc';
}

export interface EtherscanTokenTransferParams {
  address: string;
  chainId: number;
  contractaddress?: string;
  startblock?: number;
  endblock?: number;
  page?: number;
  offset?: number;
  sort?: 'asc' | 'desc';
}

export interface EtherscanFundingParams {
  address: string;
  chainId: number;
}

// Service Configuration
export interface EtherscanConfig {
  apiKey: string;
  timeout?: number;
}

// Rate limiting and error handling
export interface EtherscanRateLimit {
  callsPerSecond: number;
  callsPerDay: number;
  remainingCalls: number;
}

export interface EtherscanError {
  status: string;
  message: string;
  result: string;
}
