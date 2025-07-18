import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

import { ParsedUser, ParsedUserPersona, SuiteDatabaseCore } from '@getgrowly/core';
import { Address } from '@getgrowly/persona';

import { SUITE_CORE } from '../../constants/services';
import { EtherscanService } from '../etherscan/etherscan.service';
import { PERSONA_BUILD_JOB, PERSONA_QUEUE } from '../sync-persona/persona.queue';

export interface UniqueAddressesResponse {
  contractAddress: string;
  chainId: number;
  uniqueAddresses: string[];
  totalCount: number;
  transactionsAnalyzed: number;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(SUITE_CORE) private readonly suiteCore: SuiteDatabaseCore,
    @InjectQueue(PERSONA_QUEUE) private readonly personaQueue: Queue,
    private readonly etherscanService: EtherscanService
  ) {}

  /**
   * Validate Ethereum address format
   */
  private isValidAddress(address: string): boolean {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
  }

  async getUserPersona(walletAddress: Address): Promise<ParsedUserPersona | null> {
    return this.suiteCore.userPersonas.getOneByAddress(walletAddress);
  }

  async createUserIfNotExist(walletAddress: Address): Promise<ParsedUser | null> {
    const { new: isNew, user } =
      await this.suiteCore.users.createUserFromAddressIfNotExist(walletAddress);
    if (!isNew) return user;

    // If the user is new, we will enqueue the build persona job.
    await this.personaQueue.add(
      PERSONA_BUILD_JOB,
      { walletAddress },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        // Only keep failed jobs for debugging
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
    return user;
  }

  async importUniqueAddresses(
    contractAddress: string,
    chainId = 1
  ): Promise<UniqueAddressesResponse> {
    const startTime = Date.now();

    // Validate contract address format
    if (!this.isValidAddress(contractAddress)) {
      this.logger.error(`Invalid contract address format: ${contractAddress}`);
      throw new Error(`Invalid contract address format: ${contractAddress}`);
    }

    this.logger.log(
      `Starting unique addresses import for contract: ${contractAddress}, chainId: ${chainId}`
    );

    try {
      // Fetch up to 10,000 transactions for the contract address
      this.logger.log(`Fetching transactions for contract ${contractAddress} on chain ${chainId}`);
      const transactions = await this.etherscanService.getTransactions(contractAddress, chainId, {
        offset: 10000,
        sort: 'desc',
      });

      this.logger.log(
        `Retrieved ${transactions.length} transactions for contract ${contractAddress}`
      );

      // Extract unique addresses from 'from' and 'to' fields
      const addressSet = new Set<string>();
      let fromAddressCount = 0;
      let toAddressCount = 0;
      let zeroAddressesFiltered = 0;
      let invalidAddressesFiltered = 0;

      transactions.forEach(tx => {
        // Process 'from' address
        if (tx.from && tx.from !== '0x0000000000000000000000000000000000000000') {
          const fromAddress = tx.from.toLowerCase();
          if (this.isValidAddress(fromAddress)) {
            if (!addressSet.has(fromAddress)) {
              addressSet.add(fromAddress);
              fromAddressCount++;
            }
          } else {
            invalidAddressesFiltered++;
            this.logger.warn(`Invalid 'from' address found in transaction ${tx.hash}: ${tx.from}`);
          }
        } else if (tx.from === '0x0000000000000000000000000000000000000000') {
          zeroAddressesFiltered++;
        }

        // Process 'to' address
        if (tx.to && tx.to !== '0x0000000000000000000000000000000000000000') {
          const toAddress = tx.to.toLowerCase();
          if (this.isValidAddress(toAddress)) {
            if (!addressSet.has(toAddress)) {
              addressSet.add(toAddress);
              toAddressCount++;
            }
          } else {
            invalidAddressesFiltered++;
            this.logger.warn(`Invalid 'to' address found in transaction ${tx.hash}: ${tx.to}`);
          }
        } else if (tx.to === '0x0000000000000000000000000000000000000000') {
          zeroAddressesFiltered++;
        }
      });

      // Convert Set to Array and sort for consistent ordering
      const uniqueAddresses = Array.from(addressSet).sort();

      const processingTime = Date.now() - startTime;
      this.logger.log(`Unique addresses import completed in ${processingTime}ms`);
      this.logger.log(
        `Results: ${uniqueAddresses.length} unique addresses from ${transactions.length} transactions`
      );
      this.logger.log(
        `Address breakdown: ${fromAddressCount} unique 'from' addresses, ${toAddressCount} unique 'to' addresses`
      );
      this.logger.log(
        `Filtered out ${zeroAddressesFiltered} zero addresses and ${invalidAddressesFiltered} invalid addresses`
      );

      const result: UniqueAddressesResponse = {
        contractAddress,
        chainId,
        uniqueAddresses,
        totalCount: uniqueAddresses.length,
        transactionsAnalyzed: transactions.length,
      };

      this.logger.log(`Successfully completed unique addresses import for ${contractAddress}`);
      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Unique addresses import failed after ${processingTime}ms for contract ${contractAddress}: ${error.message}`
      );
      this.logger.error(`Error details:`, error.stack);
      throw new Error(`Failed to import unique addresses: ${error.message}`);
    }
  }
}
