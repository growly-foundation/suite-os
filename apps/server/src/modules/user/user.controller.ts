import { BadRequestException, Body, Controller, Get, Logger, Post } from '@nestjs/common';

import { ImportContractUserOutput, ImportUserOutput } from '@getgrowly/core';
import { Address } from '@getgrowly/persona';

import { UserImporterService } from './user-importer/user-importer.service';
import { UniqueAddressesResponse, UserService } from './user.service';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly userImporterService: UserImporterService
  ) {}

  @Get('persona')
  async getUserPersona(@Body('walletAddress') walletAddress: Address) {
    return this.userService.getUserPersona(walletAddress);
  }

  @Post('commit-imported-users')
  async commitImportedUsers(
    @Body('users') users: ImportUserOutput[],
    @Body('organizationId') organizationId: string
  ) {
    return this.userImporterService.commitImportedUsers(users, organizationId);
  }

  @Post()
  async createUserIfNotExist(
    @Body('walletAddress') walletAddress: Address,
    @Body('organizationId') organizationId: string
  ) {
    return this.userService.createUserIfNotExist(walletAddress, organizationId);
  }

  @Post('import-privy')
  async importUsersFromPrivy(
    @Body('appId') appId: string,
    @Body('appSecret') appSecret: string
  ): Promise<ImportUserOutput[]> {
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
    if (!contractAddress) {
      throw new BadRequestException('Missing contractAddress');
    }
    if (!chainId || chainId <= 0) {
      throw new BadRequestException('Invalid chainId');
    }
    return this.userService.importContractUsers(contractAddress, chainId);
  }

  @Post('import-unique-addresses')
  async importUniqueAddresses(
    @Body('contractAddress') contractAddress: string,
    @Body('chainId') chainId?: number
  ): Promise<{
    success: boolean;
    data?: UniqueAddressesResponse;
    error?: string;
  }> {
    const startTime = Date.now();
    this.logger.log(
      `Received import-unique-addresses request for contract: ${contractAddress}, chainId: ${chainId}`
    );

    if (!contractAddress) {
      this.logger.warn(`Import request rejected: Contract address is required`);
      throw new BadRequestException('Contract address is required');
    }

    const parsedChainId = chainId || 1;
    if (chainId !== undefined && (isNaN(chainId) || chainId < 1)) {
      this.logger.warn(`Import request rejected: Invalid chainId: ${chainId}`);
      throw new BadRequestException('Invalid chainId');
    }

    this.logger.log(
      `Processing import request for contract: ${contractAddress}, chainId: ${parsedChainId}`
    );

    try {
      const result = await this.userService.importUniqueAddresses(contractAddress, parsedChainId);

      const processingTime = Date.now() - startTime;
      this.logger.log(`Import request completed successfully in ${processingTime}ms`);
      this.logger.log(
        `Found ${result.totalCount} unique addresses from ${result.transactionsAnalyzed} transactions`
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Check if it's a validation error (should be BadRequestException)
      if (
        error.message.includes('Invalid contract address format') ||
        error.message.includes('Invalid Ethereum address')
      ) {
        this.logger.warn(`Import request rejected after ${processingTime}ms: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      // Otherwise it's a processing error
      this.logger.error(
        `Import request failed after ${processingTime}ms for contract ${contractAddress}: ${error.message}`
      );
      this.logger.error(`Error details:`, error.stack);

      return {
        success: false,
        error: error.message,
      };
    }
  }
}
