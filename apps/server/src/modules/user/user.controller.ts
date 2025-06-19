import { Body, Controller, Get, Post } from '@nestjs/common';

import { Address } from '@getgrowly/persona';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('persona')
  async getUserPersona(@Body('walletAddress') walletAddress: Address) {
    return this.userService.getUserPersona(walletAddress);
  }

  @Post()
  async createUserIfNotExist(@Body('walletAddress') walletAddress: Address) {
    return this.userService.createUserIfNotExist(walletAddress);
  }
}
