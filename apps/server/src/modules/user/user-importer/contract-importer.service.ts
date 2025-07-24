import { Injectable, Logger } from '@nestjs/common';

import { ImportContractUserOutput, UserImportSource } from '@getgrowly/core';

import { EtherscanService, EtherscanTransaction } from '../../etherscan/etherscan.service';

export interface UniqueAddressesResponse {
  contractAddress: string;
  chainId: number;
  uniqueAddresses: string[];
  totalCount: number;
  transactionsAnalyzed: number;
}

interface AddressProcessingStats {
  fromAddressCount: number;
  toAddressCount: number;
  zeroAddressesFiltered: number;
  invalidAddressesFiltered: number;
}

@Injectable()
export class ContractImporterService {
  private readonly logger = new Logger(ContractImporterService.name);

  constructor(private readonly etherscanService: EtherscanService) {}

  /**
   * Imports contract users that have interacted with a specific contract
   */
  async importContractUsers(
    contractAddress: string,
    chainId: number
  ): Promise<ImportContractUserOutput[]> {
    this.logger.log(`Starting contract user import for ${contractAddress} on chain ${chainId}`);

    // Validate input parameters
    this.validateInput(contractAddress, chainId);

    // Fetch transactions for the contract
    const transactions = await this.fetchTransactions(contractAddress, chainId);

    // Extract unique addresses from transactions
    const { uniqueAddresses, stats } = await this.extractUniqueAddresses(transactions);

    // Convert addresses to ImportContractUserOutput format
    const contractUsers = uniqueAddresses.map(address => ({
      walletAddress: address,
      extra: {
        contractAddress,
        chainId,
        transactionCount: this.getTransactionCountForAddress(address, transactions),
        firstInteraction: this.getFirstInteractionForAddress(address, transactions),
        lastInteraction: this.getLastInteractionForAddress(address, transactions),
      },
      source: UserImportSource.Contract,
    }));

    // Log processing results
    this.logProcessingResults(contractAddress, chainId, contractUsers.length, stats);

    return contractUsers;
  }

  /**
   * Validates input parameters
   */
  private validateInput(contractAddress: string, chainId: number): void {
    if (!contractAddress || !this.isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    if (!chainId || chainId <= 0) {
      throw new Error(`Invalid chain ID: ${chainId}`);
    }
  }

  /**
   * Fetches transactions for the specified contract
   */
  private async fetchTransactions(contractAddress: string, chainId: number) {
    this.logger.debug(`Fetching transactions for contract ${contractAddress}`);

    try {
      const transactions = await this.etherscanService.getTransactions(contractAddress, chainId, {
        offset: 10000,
        sort: 'desc',
      });

      this.logger.debug(`Fetched ${transactions.length} transactions`);
      return transactions;
    } catch (error) {
      this.logger.error(`Failed to fetch transactions: ${error.message}`);
      throw new Error(`Failed to fetch transactions for contract ${contractAddress}`);
    }
  }

  /**
   * Extracts unique addresses from transaction data
   */
  private async extractUniqueAddresses(transactions: EtherscanTransaction[]): Promise<{
    uniqueAddresses: string[];
    stats: AddressProcessingStats;
  }> {
    const uniqueAddresses = new Set<string>();
    const stats: AddressProcessingStats = {
      fromAddressCount: 0,
      toAddressCount: 0,
      zeroAddressesFiltered: 0,
      invalidAddressesFiltered: 0,
    };

    for (const tx of transactions) {
      // Process 'from' address
      if (tx.from) {
        const processedFrom = this.processAddress(tx.from, stats);
        if (processedFrom) {
          uniqueAddresses.add(processedFrom);
          stats.fromAddressCount++;
        }
      }

      // Process 'to' address
      if (tx.to) {
        const processedTo = this.processAddress(tx.to, stats);
        if (processedTo) {
          uniqueAddresses.add(processedTo);
          stats.toAddressCount++;
        }
      }
    }

    return {
      uniqueAddresses: Array.from(uniqueAddresses),
      stats,
    };
  }

  /**
   * Processes individual addresses with validation and filtering
   */
  private processAddress(address: string, stats: AddressProcessingStats): string | null {
    const normalizedAddress = address.toLowerCase().trim();

    // Filter out zero addresses
    if (this.isZeroAddress(normalizedAddress)) {
      stats.zeroAddressesFiltered++;
      return null;
    }

    // Validate address format
    if (!this.isValidAddress(normalizedAddress)) {
      stats.invalidAddressesFiltered++;
      return null;
    }

    return normalizedAddress;
  }

  /**
   * Gets transaction count for a specific address
   */
  private getTransactionCountForAddress(
    address: string,
    transactions: EtherscanTransaction[]
  ): number {
    return transactions.filter(
      tx =>
        tx.from?.toLowerCase() === address.toLowerCase() ||
        tx.to?.toLowerCase() === address.toLowerCase()
    ).length;
  }

  /**
   * Gets first interaction timestamp for a specific address
   */
  private getFirstInteractionForAddress(
    address: string,
    transactions: EtherscanTransaction[]
  ): string | undefined {
    const addressTransactions = transactions.filter(
      tx =>
        tx.from?.toLowerCase() === address.toLowerCase() ||
        tx.to?.toLowerCase() === address.toLowerCase()
    );

    if (addressTransactions.length === 0) return undefined;

    // Sort by timestamp (ascending) and get the first one
    const sortedTransactions = addressTransactions.sort(
      (a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp)
    );

    return new Date(parseInt(sortedTransactions[0].timeStamp) * 1000).toISOString();
  }

  /**
   * Gets last interaction timestamp for a specific address
   */
  private getLastInteractionForAddress(
    address: string,
    transactions: EtherscanTransaction[]
  ): string | undefined {
    const addressTransactions = transactions.filter(
      tx =>
        tx.from?.toLowerCase() === address.toLowerCase() ||
        tx.to?.toLowerCase() === address.toLowerCase()
    );

    if (addressTransactions.length === 0) return undefined;

    // Sort by timestamp (descending) and get the first one (most recent)
    const sortedTransactions = addressTransactions.sort(
      (a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp)
    );

    return new Date(parseInt(sortedTransactions[0].timeStamp) * 1000).toISOString();
  }

  /**
   * Logs processing results and statistics
   */
  private logProcessingResults(
    contractAddress: string,
    chainId: number,
    uniqueCount: number,
    stats: AddressProcessingStats
  ): void {
    this.logger.log(`Contract processing complete for ${contractAddress} on chain ${chainId}:`);
    this.logger.log(`- Unique addresses found: ${uniqueCount}`);
    this.logger.log(`- From addresses processed: ${stats.fromAddressCount}`);
    this.logger.log(`- To addresses processed: ${stats.toAddressCount}`);
    this.logger.log(`- Zero addresses filtered: ${stats.zeroAddressesFiltered}`);
    this.logger.log(`- Invalid addresses filtered: ${stats.invalidAddressesFiltered}`);
  }

  /**
   * Checks if an address is a zero address
   */
  private isZeroAddress(address: string): boolean {
    return address === '0x0000000000000000000000000000000000000000';
  }

  /**
   * Validates Ethereum address format
   */
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}
