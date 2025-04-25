import { Module } from '@nestjs/common';
import { EvmChainService } from './evm.service';
import { EvmController } from './evm.controller';
import { OnchainBusterService } from '../onchain-buster';

@Module({
  providers: [EvmChainService, OnchainBusterService],
  exports: [EvmChainService, OnchainBusterService],
  controllers: [EvmController],
})
export class EvmModule {}
