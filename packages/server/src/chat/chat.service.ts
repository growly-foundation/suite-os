import { Injectable, Logger } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';
import { MessageService } from '../message/message.service';

interface ChatRequest {
  message: string;
  userId: string;
  agentId?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly agentService: AgentService,
    private readonly messageService: MessageService
  ) {}

  async chat({ message, userId, agentId = 'test' }: ChatRequest) {
    try {
      // 1. Store the user message
      await this.messageService.storeMessage(message, userId, agentId, 'user');

      // 2. Load conversation history
      const history = await this.messageService.getConversationHistory(userId, agentId);

      this.logger.log(
        `Loaded ${history.length} messages from conversation history for thread ${userId}`
      );

      // 3. Process with supervisor agent from AgentService
      this.logger.log('Processing with multi-agent supervisor...');
      // const reply = await this.agentService.reactAgentChat({
      //   message,
      //   userId,
      //   agentId,
      //   history,
      // });

      const reply = await this.agentService.chat({
        message,
        userId,
        agentId,
      });

      // 4. Store the assistant's response
      await this.messageService.storeMessage(reply, userId, agentId, 'assistant');

      // Return the response
      return reply;
    } catch (error) {
      this.logger.error(`Error in chat processing: ${error.message}`, error.stack);
      throw error;
    }
  }
}
