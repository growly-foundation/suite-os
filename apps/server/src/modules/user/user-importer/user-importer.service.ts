import { Inject, Injectable, Logger } from '@nestjs/common';
import { SUITE_CORE } from 'src/constants/services';

import {
  ImportContractUserOutput,
  ImportPrivyUserOutput,
  ImportUserOutput,
  ParsedUser,
  SuiteDatabaseCore,
  UserImportSource,
} from '@getgrowly/core';

import { ContractImporterService } from './contract-importer.service';
import { PrivyImporterService } from './privy-importer.service';

@Injectable()
export class UserImporterService {
  private readonly logger = new Logger(UserImporterService.name);

  constructor(
    private readonly privyImporterService: PrivyImporterService,
    private readonly contractProcessingService: ContractImporterService,
    @Inject(SUITE_CORE) private readonly suiteCore: SuiteDatabaseCore
  ) {}

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
   * Saves users to the database with proper source tracking
   */
  async commitImportedUsers(
    users: ImportUserOutput[],
    organizationId: string
  ): Promise<{
    success: ParsedUser[];
    failed: { user: ImportUserOutput; error: string }[];
  }> {
    this.logger.log(`Saving ${users.length} users to database`);

    const success: ParsedUser[] = [];
    const failed: { user: ImportUserOutput; error: string }[] = [];
    for (const user of users) {
      try {
        if (!user.walletAddress) {
          failed.push({ user, error: 'Missing wallet address' });
          continue;
        }

        // Create or update user with source tracking
        const savedUser = await this.createUserWithSource(user, organizationId);
        if (savedUser) {
          success.push(savedUser);
        } else {
          failed.push({ user, error: 'Failed to create user' });
        }
      } catch (error) {
        this.logger.error(`Failed to save user ${user.walletAddress}: ${error.message}`);
        failed.push({ user, error: error.message });
      }
    }

    this.logger.log(`User import completed: ${success.length} successful, ${failed.length} failed`);
    return { success, failed };
  }

  /**
   * Creates a user with proper source tracking
   */
  private async createUserWithSource(
    importedUser: ImportUserOutput,
    organizationId: string
  ): Promise<any> {
    this.logger.log(
      `Creating user ${importedUser.walletAddress} with source ${importedUser.source}`
    );
    if (!importedUser.walletAddress) {
      throw new Error('Missing wallet address');
    }
    const { user } = await this.suiteCore.users.createUserFromAddressIfNotExist(
      importedUser.walletAddress,
      organizationId,
      {
        source: importedUser.source,
        sourceData: importedUser.extra || {},
      }
    );
    return user;
  }
}
