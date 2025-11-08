import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../databases/database.module';
import { FirecrawlModule } from '../firecrawl/firecrawl.module';
import { AgentFactoryService } from './agent-factory.service';
import { AgentService } from './agent.service';
import { CheckpointerService } from './checkpointer.service';

@Module({
  imports: [ConfigModule, DatabaseModule, FirecrawlModule],
  providers: [CheckpointerService, AgentFactoryService, AgentService],
  exports: [AgentService, AgentFactoryService, CheckpointerService],
})
export class AgentModule {}
