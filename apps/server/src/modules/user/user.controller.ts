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
}
