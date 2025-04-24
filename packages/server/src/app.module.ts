import { Module } from '@nestjs/common';
import { AppController } from './app.controller.ts';
import { ChainService } from './modules/chain/chain.service.ts';
import { EvmModule } from './modules/evm/evm.module.ts';
import { SonicModule } from './modules/sonic/sonic.module.ts';

@Module({
  imports: [EvmModule, SonicModule],
  controllers: [AppController],
  providers: [ChainService],
})
export class AppModule {}
