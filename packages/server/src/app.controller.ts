import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ChainService } from './modules/chain/chain.service.ts';
import type { TChainMetadataListResponse } from 'chainsmith-sdk';

@Controller()
export class AppController {
  constructor(@Inject(ChainService) private readonly appService: ChainService) {}

  @Get('/chainlist/:id')
  async getChainMetadata(
    @Param() params: { id: number }
  ): Promise<TChainMetadataListResponse | undefined> {
    return this.appService.getChainMetadata(params.id);
  }
}
