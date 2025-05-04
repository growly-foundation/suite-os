/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/langchain/langchain.service.ts
import { Injectable } from '@nestjs/common';
import { createAgent } from './agent/agent.factory';
import { ChatProvider } from './agent/model.factory';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LangchainService {
  private readonly agent: ReturnType<typeof createAgent>;

  constructor(private readonly configService: ConfigService) {
    const provider: ChatProvider =
      (this.configService.get('MODEL_PROVIDER') as ChatProvider) || 'openai';
    this.agent = createAgent(provider, this.configService);
  }

  async chat(input: string): Promise<string> {
    const stream = await this.agent.stream(
      { messages: [{ content: input, role: 'user' }] }, // The new message to send to the agent
      { configurable: { thread_id: 'AgentKit Discussion' } }, // Customizable thread ID for tracking conversations
    );

    let agentResponse = '';
    for await (const chunk of stream) {
      if ('agent' in chunk) {
        console.log(chunk.agent.messages[0].content);
        agentResponse += chunk.agent.messages[0].content;
      }
    }
    return agentResponse;
  }
}
