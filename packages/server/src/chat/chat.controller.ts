// src/chat/chat.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body('message') message: string,
    @Body('userId') userId: string,
    @Body('agentId') agentId: string
  ) {
    const reply = await this.chatService.chat({ message, userId, agentId });
    return { reply };
  }

  @Post('growly')
  growlyChat(
    @Body('message') message: string,
    @Body('userId') userId: string,
    @Body('agentId') agentId: string
  ) {
    // TODO: Implement growly chat
    // const reply = await this.chatService.chat({ message, userId, agentId });
    return {
      agentId,
      userId,
      message: 'You were charged $0.001 USDC on base-sepolia',
    };
  }
}
