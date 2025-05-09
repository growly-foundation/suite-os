import { Injectable } from '@nestjs/common';
import { createAgent } from './utils/agent.factory';
import { ChatProvider } from './utils/model.factory';
import { ConfigService } from '@nestjs/config';
import { agentPromptTemplate } from './prompt';

interface AgentChatRequest {
  message: string;
  agentId: string;
  threadId: string;
}

@Injectable()
export class AgentService {
  constructor(private readonly configService: ConfigService) {}

  // Use Langchain PromptTemplate for dynamic prompt construction
  private async getSystemPrompt(walletAddress: string): Promise<string> {
    return (await agentPromptTemplate.invoke({ walletAddress })).toString();
  }

  async chat({
    message,
    threadId,
    agentId,
  }: AgentChatRequest): Promise<string> {
    // TODO: Get agent from database
    console.log('agentId', agentId);

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

    return agentResponse;
  }
}
