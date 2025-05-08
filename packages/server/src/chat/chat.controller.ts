// src/chat/chat.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body('message') message: string,
    @Body('agentId') agentId: string,
    @Body('threadId') threadId: string,
  ) {
    const reply = await this.chatService.chat({ message, agentId, threadId });
    return { reply };
  }
}
