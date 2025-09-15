import { Module } from '@nestjs/common';

import { ConversationGateway } from './websocket.gateway';

@Module({
  providers: [ConversationGateway],
  exports: [ConversationGateway],
})
export class WebSocketModule {}
