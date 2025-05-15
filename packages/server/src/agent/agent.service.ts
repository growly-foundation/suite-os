// import { ChatOpenAI } from '@langchain/openai';
import { SuiteDatabaseCore } from '@growly/core';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { agentPromptTemplate } from './prompt';
import { AgentOptions, createAgent } from './utils/agent.factory';
import { ChatProvider } from './utils/model.factory';

interface AgentChatRequest {
  message: string;
  agentId: string;
  userId: string;
  useReactAgent?: boolean;
}

interface SupervisorChatRequest {
  message: string;
  userId: string;
  agentId: string;
  history: any[];
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('GROWLY_SUITE_CORE') private readonly suiteCore: SuiteDatabaseCore
  ) {}

  // Use Langchain PromptTemplate for dynamic prompt construction
  private async getSystemPrompt(walletAddress: string): Promise<string> {
    return (await agentPromptTemplate.invoke({ walletAddress })).toString();
  }

  /**
   * Regular chat using the standard agent with persistence
   */
  async chat({ message, userId, agentId }: AgentChatRequest): Promise<string> {
    this.logger.log(`Processing chat request for agent ${agentId} and user ${userId}`);

    const user = await this.suiteCore.db.users.getById(userId);
    const walletAddress = user?.entities?.['walletAddress'] || '';

    // Get provider from config
    const provider: ChatProvider =
      (this.configService.get('MODEL_PROVIDER') as ChatProvider) || 'openai';

    // Get system prompt
    const systemPrompt = await this.getSystemPrompt(walletAddress);

    // Create agent options
    const agentOptions: AgentOptions = {
      provider,
      agentId,
      systemPrompt,
    };

    // Get or create agent with persistence
    const agent = await createAgent(agentOptions, this.configService);

    // Stream the response with thread persistence
    const stream = await agent.stream(
      { messages: [{ content: message, role: 'user' }] },
      { configurable: { thread_id: `${agentId}-${userId}` } }
    );

    let agentResponse = '';
    for await (const chunk of stream) {
      if ('agent' in chunk) {
        this.logger.debug(chunk.agent.messages[0].content);
        agentResponse += chunk.agent.messages[0].content;
      }
    }

    return agentResponse;
  }
}
