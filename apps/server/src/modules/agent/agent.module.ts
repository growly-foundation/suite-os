import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../databases/database.module';
import { FirecrawlModule } from '../firecrawl/firecrawl.module';
import { AgentService } from './agent.service';

@Module({
  imports: [ConfigModule, DatabaseModule, FirecrawlModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
