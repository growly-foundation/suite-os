import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../databases/database.module';
import { SupabaseModule } from '../databases/supabase.module';
import { EtherscanModule } from '../etherscan/etherscan.module';
import { FirecrawlModule } from '../firecrawl/firecrawl.module';
import { OpenAIModule } from '../openai/openai.module';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    SupabaseModule,
    EtherscanModule,
    FirecrawlModule,
    OpenAIModule,
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
