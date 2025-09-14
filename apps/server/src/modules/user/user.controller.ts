import { BadRequestException, Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { ImportContractUserOutput, ImportUserOutput } from '@getgrowly/core';
import { Address } from '@getgrowly/persona';

import { RedisService } from '../queue/redis.service';
import { UserImporterService } from './user-importer/user-importer.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly userImporterService: UserImporterService,
    private readonly redisService: RedisService
  ) {}

  @Get('persona')
  async getUserPersona(@Body('walletAddress') walletAddress: Address) {
    this.logger.log(
      `[${this.constructor.name}] Getting user persona for wallet address: ${walletAddress}`
    );
    return this.userService.getUserPersona(walletAddress);
  }

  @Get('organization-limits')
  async getOrganizationLimits(
    @Query('organizationId') organizationId: string,
    @Query('usersToImport') usersToImport: number
  ) {
    this.logger.log(
      `[${this.constructor.name}] Checking organization limits for: ${organizationId}`
    );
    if (!organizationId) {
      throw new BadRequestException('Missing organizationId');
    }
    return this.userImporterService.checkOrganizationLimits(organizationId, usersToImport || 0);
  }

  @Get('import-job-status')
  async getImportJobStatus(@Query('jobId') jobId: string) {
    this.logger.log(`[${this.constructor.name}] Getting job status for: ${jobId}`);
    if (!jobId) {
      throw new BadRequestException('Missing jobId');
    }
    return this.redisService.getJobStatus(jobId);
  }

  @Get('organization-jobs')
  async getOrganizationJobs(@Query('organizationId') organizationId: string) {
    this.logger.log(`[${this.constructor.name}] Getting jobs for organization: ${organizationId}`);
    if (!organizationId) {
      throw new BadRequestException('Missing organizationId');
    }
    return this.redisService.getOrganizationJobs(organizationId);
  }

  @Post('commit-imported-users')
  async commitImportedUsers(
    @Body('users') users: ImportUserOutput[],
    @Body('organizationId') organizationId: string,
    @Body('jobId') jobId?: string
  ) {
    this.logger.log(
      `[${this.constructor.name}] Committing imported users for organization: ${organizationId}`
    );

    // Create job if not provided
    const actualJobId = jobId || uuidv4();
    if (!jobId) {
      await this.redisService.createImportJob(actualJobId, organizationId, 'manual', users.length);
    }

    return this.userImporterService.commitImportedUsers(users, organizationId, actualJobId);
  }

  @Post('commit-imported-users-async')
  async commitImportedUsersAsync(
    @Body('users') users: ImportUserOutput[],
    @Body('organizationId') organizationId: string
  ) {
    const jobId = uuidv4();
    this.logger.log(
      `[${this.constructor.name}] Starting async import job ${jobId} for organization: ${organizationId}`
    );

    // Create job
    await this.redisService.createImportJob(jobId, organizationId, 'manual', users.length);

    // Start async processing (don't await)
    this.userImporterService.commitImportedUsers(users, organizationId, jobId).catch(error => {
      this.logger.error(`Async import job ${jobId} failed:`, error);
      this.redisService.completeJob(jobId, { success: 0, failed: users.length }, error.message);
    });

    return { jobId, status: 'started' };
  }

  @Post()
  async createUserIfNotExist(
    @Body('walletAddress') walletAddress: Address,
    @Body('organizationId') organizationId: string
  ) {
    this.logger.log(
      `[${this.constructor.name}] Creating user if not exists for wallet address: ${walletAddress} and organization: ${organizationId}`
    );
    return this.userService.createUserIfNotExist(walletAddress, organizationId);
  }

  @Post('import-privy')
  async importUsersFromPrivy(
    @Body('appId') appId: string,
    @Body('appSecret') appSecret: string
  ): Promise<ImportUserOutput[]> {
    this.logger.log(`[${this.constructor.name}] Importing users from Privy for appId: ${appId}`);
    if (!appId || !appSecret) {
      throw new BadRequestException('Missing appId or appSecret');
    }
    return this.userImporterService.importUsersFromPrivy(appId, appSecret);
  }

  @Post('import-contract')
  async importContractUsers(
    @Body('contractAddress') contractAddress: string,
    @Body('chainId') chainId: number
  ): Promise<ImportContractUserOutput[]> {
    this.logger.log(
      `[${this.constructor.name}] Importing contract users for contract address: ${contractAddress} and chainId: ${chainId}`
    );
    if (!contractAddress || typeof contractAddress !== 'string') {
      throw new BadRequestException('Missing contractAddress');
    }
    if (!chainId || !Number.isInteger(chainId) || chainId <= 0) {
      throw new BadRequestException('Invalid chainId');
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      throw new BadRequestException('Invalid contract address format');
    }
    return this.userService.importContractUsers(contractAddress, chainId);
  }

  @Post('import-nft-holders')
  async importNftHolders(
    @Body('contractAddress') contractAddress: string,
    @Body('chainId') chainId: number
  ): Promise<ImportContractUserOutput[]> {
    this.logger.log(
      `[${this.constructor.name}] Importing NFT holders for contract address: ${contractAddress} and chainId: ${chainId}`
    );
    return this.userService.importNftHolders(contractAddress, chainId);
  }
}
