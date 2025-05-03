// src/chat/chat.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { LangchainService } from '../langchain/langchain.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly langchainService: LangchainService) {}

  @Post()
  async chat(@Body('message') message: string) {
    const reply = await this.langchainService.chat(message);
    return { reply };
  }
}
