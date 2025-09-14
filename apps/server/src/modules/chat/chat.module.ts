import { Module } from '@nestjs/common';

import { AgentModule } from '../agent/agent.module';
import { MessageModule } from '../message/message.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [AgentModule, MessageModule, WebSocketModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
