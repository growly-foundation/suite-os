import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../databases/database.module';
import { SupabaseModule } from '../databases/supabase.module';
import { EtherscanModule } from '../etherscan/etherscan.module';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

@Module({
  imports: [ConfigModule, DatabaseModule, SupabaseModule, EtherscanModule],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
