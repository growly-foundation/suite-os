import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';

import { ImportUserOutput } from '@getgrowly/core';
import { Address } from '@getgrowly/persona';

import { UserImporterService } from './user-importer/user-importer.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userImporterService: UserImporterService
  ) {}

  @Get('persona')
  async getUserPersona(@Body('walletAddress') walletAddress: Address) {
    return this.userService.getUserPersona(walletAddress);
  }

  @Post('import-privy')
  async importUserFromPrivy(
    @Body('appId') appId: string,
    @Body('appSecret') appSecret: string
  ): Promise<ImportUserOutput[]> {
    if (!appId || !appSecret) {
      throw new BadRequestException('Missing appId or appSecret');
    }
    return this.userImporterService.importUsersFromPrivy(appId, appSecret);
  }

  @Post()
  async createUserIfNotExist(@Body('walletAddress') walletAddress: Address) {
    return this.userService.createUserIfNotExist(walletAddress);
  }
}
