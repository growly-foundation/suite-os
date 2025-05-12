import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';

@Controller('growly')
export class GrowlyController {
  constructor(private readonly chatService: ChatService) {}

  // @Post()
  // async chat(
  //   @Body('message') message: string,
  //   @Body('userId') userId: string,
  //   @Body('agentId') agentId: string,
  //   @Body('isBeastMode') isBeastMode: boolean
  // ) {
  //   const reply = await this.chatService.chat({ message, userId, agentId });
  //   return { reply };
  // }

  @Post()
  async chat(
    @Body('message') message: string,
    @Body('userId') userId: string,
    @Body('agentId') agentId: string,
    @Body('stepId') stepId: string
  ) {
    // TODO: Implement growly chat
    // const reply = await this.chatService.chat({ message, userId, agentId });
    return {
      reply: 'You were charged $0.001 USDC on base-sepolia',
    };
  }
}
