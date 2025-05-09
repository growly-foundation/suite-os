import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AgentModule } from '../agent/agent.module';
import { DatabaseModule } from '../databases/database.module';

@Module({
  imports: [AgentModule, DatabaseModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
