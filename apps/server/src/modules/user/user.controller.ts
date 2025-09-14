import { BadRequestException, Body, Controller, Get, Logger, Post } from '@nestjs/common';

import { ImportContractUserOutput, ImportUserOutput } from '@getgrowly/core';
import { Address } from '@getgrowly/persona';

import { UserImporterService } from './user-importer/user-importer.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly userImporterService: UserImporterService
  ) {}

  @Get('persona')
  async getUserPersona(@Body('walletAddress') walletAddress: Address) {
    this.logger.log(
      `[${this.constructor.name}] Getting user persona for wallet address: ${walletAddress}`
    );
    return this.userService.getUserPersona(walletAddress);
  }

  @Post('commit-imported-users')
  async commitImportedUsers(
    @Body('users') users: ImportUserOutput[],
    @Body('organizationId') organizationId: string
  ) {
    this.logger.log(
      `[${this.constructor.name}] Committing imported users for organization: ${organizationId}`
    );
    return this.userImporterService.commitImportedUsers(users, organizationId);
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
