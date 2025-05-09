import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../databases/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
