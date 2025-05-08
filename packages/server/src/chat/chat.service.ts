import { Injectable } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';

interface ChatRequest {
  message: string;
  agentId: string;
  threadId: string;
}

@Injectable()
export class ChatService {
  constructor(private readonly agentService: AgentService) {}

  async chat({ message, agentId, threadId }: ChatRequest) {
    return this.agentService.chat({ message, agentId, threadId });
  }
}
