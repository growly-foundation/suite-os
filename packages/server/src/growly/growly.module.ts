import { Module } from '@nestjs/common';
import { MessageModule } from 'src/message/message.module';
import { AgentModule } from '../agent/agent.module';
import { GrowlyController } from './growly.controller';
import { ChatService } from 'src/chat/chat.service';

@Module({
  imports: [AgentModule, MessageModule],
  controllers: [GrowlyController],
  providers: [ChatService],
})
export class GrowlyModule {}
