// src/chat/chat.controller.ts
import { Body, Controller, MessageEvent, Post, Query, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';

import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body('message') message: string,
    @Body('userId') userId: string,
    @Body('agentId') agentId: string,
    @Body('stepId') stepId: string,
    @Body('isBeastMode') isBeastMode: boolean
  ) {
    const reply = await this.chatService.dumbChat({ message, userId, agentId });
    return { reply };
  }

  @Sse('stream')
  chatStream(
    @Query('message') message: string,
    @Query('userId') userId: string,
    @Query('agentId') agentId: string,
    @Query('stepId') stepId: string,
    @Query('isBeastMode') isBeastMode = false
  ): Observable<MessageEvent> {
    console.log('📨 SSE Stream params:', { message, userId, agentId, stepId, isBeastMode });

    // Validate required parameters
    if (!message || !userId || !agentId) {
      throw new Error(
        `Missing required parameters: message=${message}, userId=${userId}, agentId=${agentId}`
      );
    }

    return this.chatService.chatStream({ message, userId, agentId });
  }
}
