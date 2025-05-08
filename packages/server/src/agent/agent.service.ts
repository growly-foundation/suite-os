/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/langchain/langchain.service.ts
import { Injectable } from '@nestjs/common';
import { createAgent } from './utils/agent.factory';
import { ChatProvider } from './utils/model.factory';
import { ConfigService } from '@nestjs/config';

interface AgentChatRequest {
  message: string;
  agentId: string;
  threadId: string;
}

@Injectable()
export class AgentService {
  constructor(private readonly configService: ConfigService) {}

  // Mock: Load system prompt for agentId
  private getSystemPrompt(agentId: string): string {
    // In production, fetch from DB or config
    const prompts: Record<string, string> = {
      default: `You are a helpful agent that is an expert in Web3 and Crypto, especially DeFi protocol.\n\nYou can retrieve information from the blockchain about 3 main things with tools:\n- Portfolio and token holdings of a wallet address.\n- DeFi protocol information and total value locked (implementing soon).\n- Token details with its sentiment (implementing soon).\n\nIf there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you can't do with your currently available tools, you must say so.\n\nBe concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
    };
    return prompts[agentId] || prompts['default'];
  }

  async chat({
    message,
    agentId,
    threadId,
  }: AgentChatRequest): Promise<string> {
    const provider: ChatProvider =
      (this.configService.get('MODEL_PROVIDER') as ChatProvider) || 'openai';
    const systemPrompt = this.getSystemPrompt(agentId);
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
    return agentResponse;
  }
}
