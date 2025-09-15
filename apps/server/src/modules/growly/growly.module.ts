import { Module } from '@nestjs/common';

import { AgentModule } from '../agent/agent.module';
import { ChatService } from '../chat/chat.service';
import { MessageModule } from '../message/message.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { GrowlyController } from './growly.controller';

@Module({
  imports: [AgentModule, MessageModule, WebSocketModule],
  controllers: [GrowlyController],
  providers: [ChatService],
})
export class GrowlyModule {}
