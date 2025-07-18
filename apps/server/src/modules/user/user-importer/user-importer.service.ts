import { Injectable, Logger } from '@nestjs/common';

import {
  ImportContractUserOutput,
  ImportPrivyUserOutput,
  ImportUserOutput,
  UserImportSource,
} from '@getgrowly/core';

import { ContractProcessingService, UniqueAddressesResponse } from './contract-processing.service';
import { PrivyImporterService } from './privy-importer.service';

@Injectable()
export class UserImporterService {
  private readonly logger = new Logger(UserImporterService.name);

  constructor(
    private readonly privyImporterService: PrivyImporterService,
    private readonly contractProcessingService: ContractProcessingService
  ) {}

  /**
   * Imports users from Privy
   */
  async importPrivyUsers(): Promise<ImportPrivyUserOutput[]> {
    this.logger.log('Starting Privy user import');
    const users = await this.privyImporterService.getUsers('appId', 'appSecret');
    return users.map(user => ({
      walletAddress: user.wallet?.address || user.smartWallet?.address,
      email: user.email?.address,
      extra: user,
      source: UserImportSource.Privy,
    }));
  }

  /**
   * Imports users from Privy with specific credentials
   */
  async importUsersFromPrivy(appId: string, appSecret: string): Promise<ImportPrivyUserOutput[]> {
    this.logger.log('Starting Privy user import with credentials');
    const users = await this.privyImporterService.getUsers(appId, appSecret);
    return users.map(user => ({
      walletAddress: user.wallet?.address || user.smartWallet?.address,
      email: user.email?.address,
      extra: user,
      source: UserImportSource.Privy,
    }));
  }

  /**
   * Imports contract users that have interacted with a specific contract
   */
  async importContractUsers(
    contractAddress: string,
    chainId: number
  ): Promise<ImportContractUserOutput[]> {
    this.logger.log(`Starting contract user import for ${contractAddress} on chain ${chainId}`);
    return this.contractProcessingService.importContractUsers(contractAddress, chainId);
  }

  /**
   * Saves users to the database
   */
  async saveUsers(users: ImportUserOutput[]): Promise<void> {
    this.logger.log(`Saving ${users.length} users to database`);
    // Implementation for saving users
  }

  /**
   * Imports unique addresses that have interacted with a specific contract
   * Delegates to ContractProcessingService
   */
  async importUniqueAddresses(
    contractAddress: string,
    chainId: number
  ): Promise<UniqueAddressesResponse> {
    return this.contractProcessingService.importUniqueAddresses(contractAddress, chainId);
  }
}
