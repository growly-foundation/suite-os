import { Inject, Injectable, Logger } from '@nestjs/common';
import { SUITE_CORE } from 'src/constants/services';
import { v4 as uuidv4 } from 'uuid';

import {
  ImportContractUserOutput,
  ImportNftHoldersOutput,
  ImportPrivyUserOutput,
  ImportUserOutput,
  OrganizationLimitsService,
  ParsedUser,
  SuiteDatabaseCore,
  UserImportSource,
} from '@getgrowly/core';

import { RedisService } from '../../queue/redis.service';
import { ContractImporterService } from './contract-importer.service';
import { PrivyImporterService } from './privy-importer.service';

@Injectable()
export class UserImporterService {
  private readonly logger = new Logger(UserImporterService.name);

  constructor(
    private readonly privyImporterService: PrivyImporterService,
    private readonly contractProcessingService: ContractImporterService,
    private readonly redisService: RedisService,
    @Inject(SUITE_CORE) private readonly suiteCore: SuiteDatabaseCore
  ) {}

  /**
   * Check organization user limits before importing
   */
  async checkOrganizationLimits(organizationId: string, usersToImport: number) {
    // Get current user count for the organization using the users service
    const users = await this.suiteCore.users.getUsersByOrganizationId(organizationId);
    const currentUserCount = users.length;
    return OrganizationLimitsService.checkImportLimits(currentUserCount, usersToImport);
  }

  /**
   * Imports users from Privy with specific credentials
   */
  async importUsersFromPrivy(appId: string, appSecret: string): Promise<ImportPrivyUserOutput[]> {
    this.logger.log(`Starting Privy import for app: ${appId}`);
    const users = await this.privyImporterService.getUsers(appId, appSecret);
    return users.map(user => ({
      walletAddress: user.wallet?.address || user.smartWallet?.address,
      email: user.email?.address,
      extra: user,
      source: UserImportSource.Privy,
    }));
  }

  /**
   * Imports users from a contract address
   */
  async importContractUsers(
    contractAddress: string,
    chainId: number
  ): Promise<ImportContractUserOutput[]> {
    this.logger.log(`Starting contract user import for ${contractAddress} on chain ${chainId}!`);
    return this.contractProcessingService.importContractUsers(contractAddress, chainId);
  }

  /**
   * Imports NFT holders for a specific contract
   */
  async importNftHolders(
    contractAddress: string,
    chainId: number
  ): Promise<ImportNftHoldersOutput[]> {
    this.logger.log(`Starting NFT holder import for ${contractAddress} on chain ${chainId}`);
    return this.contractProcessingService.importNftHolders(contractAddress, chainId);
  }

  /**
   * Saves users to the database with proper source tracking and progress updates
   */
  async commitImportedUsers(
    users: ImportUserOutput[],
    organizationId: string,
    jobId?: string
  ): Promise<{
    success: ParsedUser[];
    failed: { user: ImportUserOutput; error: string }[];
  }> {
    // Check organization limits
    const limits = await this.checkOrganizationLimits(organizationId, users.length);

    if (!limits.canImport) {
      throw new Error(
        `Organization has reached the maximum user limit of ${limits.maxUsers} users.`
      );
    }

    // UI already supports partial-import confirmation. Server should slice and proceed to avoid race failures.
    if (limits.exceedsLimit) {
      this.logger.warn(
        `Requested ${users.length}, proceeding with ${limits.maxAllowedImports} due to limits (${limits.currentUserCount}/${limits.maxUsers}).`
      );
    }

    // Use the allowed number of users (may be less than requested)
    const usersToProcess = users.slice(0, limits.maxAllowedImports);
    const actualJobId = jobId || uuidv4();

    this.logger.log(
      `Saving ${usersToProcess.length} users to database (limited from ${users.length})`
    );

    // Create or update job status
    if (jobId) {
      await this.redisService.updateJobProgress(actualJobId, 0, 'processing');
    }

    const success: ParsedUser[] = [];
    const failed: { user: ImportUserOutput; error: string }[] = [];

    for (let i = 0; i < usersToProcess.length; i++) {
      const user = usersToProcess[i];
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

        // Update progress
        if (jobId) {
          await this.redisService.updateJobProgress(actualJobId, i + 1);
        }
      } catch (error) {
        this.logger.error(`Failed to save user ${user.walletAddress}: ${error.message}`);
        failed.push({ user, error: error.message });
      }
    }

    // Complete job
    if (jobId) {
      await this.redisService.completeJob(actualJobId, {
        success: success.length,
        failed: failed.length,
        errors: failed.map(f => f.error),
      });
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

    return this.suiteCore.users.createUserFromAddressIfNotExist(
      importedUser.walletAddress!,
      organizationId,
      {
        source: importedUser.source,
        sourceData: importedUser.extra || {},
      }
    );
  }
}
