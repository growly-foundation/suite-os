import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EtherscanService } from './etherscan.service';

@Module({
  imports: [ConfigModule],
  providers: [EtherscanService],
  exports: [EtherscanService],
})
export class EtherscanModule {}
