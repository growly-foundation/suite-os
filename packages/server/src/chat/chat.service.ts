import { Injectable, Logger } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';
import { MessageService } from '../message/message.service';

interface ChatRequest {
  message: string;
  threadId: string;
  agentId?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly agentService: AgentService,
    private readonly messageService: MessageService,
  ) {}

  async chat({ message, threadId, agentId = 'test' }: ChatRequest) {
    try {
      // 1. Store the user message
      await this.messageService.storeMessage(
        message,
        threadId,
        agentId,
        'user',
      );

      // 2. Load conversation history
      const history = await this.messageService.getConversationHistory(
        threadId,
        agentId,
      );

      this.logger.log(
        `Loaded ${history.length} messages from conversation history for thread ${threadId}`,
      );

      // 3. Process with agent (the agent has its own memory via checkpointer)
      const reply = await this.agentService.chat({
        message,
        threadId,
        agentId,
      });

      // 4. Store the assistant's response
      await this.messageService.storeMessage(
        reply,
        threadId,
        agentId,
        'assistant',
      );

      // Return the response
      return reply;
    } catch (error) {
      this.logger.error(
        `Error in chat processing: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
