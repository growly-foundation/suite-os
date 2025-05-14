// src/chat/chat.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { SuiteCoreService } from './suite-core.service';
import { SuiteDatabaseCore } from '@growly/core';

@Controller('core')
export class SuiteCoreController {
  constructor(private readonly suiteCoreService: SuiteCoreService) {}

  @Post('call')
  async call<T extends keyof SuiteDatabaseCore>(
    @Body('service') service: T,
    @Body('method') method: keyof SuiteDatabaseCore[T],
    @Body('args') args?: any[]
  ) {
    return this.suiteCoreService.call(service, method, args);
  }

  @Post('call-db')
  async callDatabaseService(
    @Body('method') method: keyof SuiteDatabaseCore['db'],
    @Body('args') args?: any[]
  ) {
    return this.suiteCoreService.callDatabaseService(method, args);
  }
}
