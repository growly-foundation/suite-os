/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/langchain/langchain.service.ts
import { Injectable } from '@nestjs/common';
import { createAgent } from './utils/agent.factory';
import { ChatProvider } from './utils/model.factory';
import { ConfigService } from '@nestjs/config';
import { agentPromptTemplate } from './prompt';
import { MessageService } from '../supabase/services/message.service';

interface AgentChatRequest {
  message: string;
  agentId: string;
  threadId: string;
}

@Injectable()
export class AgentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly messageService: MessageService,
  ) {}

  // Use Langchain PromptTemplate for dynamic prompt construction
  private async getSystemPrompt(walletAddress: string): Promise<string> {
    return (await agentPromptTemplate.invoke({ walletAddress })).toString();
  }

  async chat({
    message,
    threadId,
    agentId,
  }: AgentChatRequest): Promise<string> {
    // Store the user message in Supabase
    await this.messageService.storeMessage(message, threadId, agentId, 'user');

    const provider: ChatProvider =
      (this.configService.get('MODEL_PROVIDER') as ChatProvider) || 'openai';
    const systemPrompt = await this.getSystemPrompt(threadId);
    const agent = createAgent(provider, this.configService, systemPrompt);

    const stream = await agent.stream(
      { messages: [{ content: message, role: 'user' }] },
      { configurable: { thread_id: threadId } },
    );

    let agentResponse = '';
    for await (const chunk of stream) {
      if ('agent' in chunk) {
        console.log(chunk.agent.messages[0].content);
        agentResponse += chunk.agent.messages[0].content;
      }
    }

    // Store the assistant response in Supabase
    await this.messageService.storeMessage(
      agentResponse,
      threadId,
      agentId,
      'assistant',
    );

    return agentResponse;
  }
}
