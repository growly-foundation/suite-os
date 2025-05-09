import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AgentModule } from '../agent/agent.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [AgentModule, MessageModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
