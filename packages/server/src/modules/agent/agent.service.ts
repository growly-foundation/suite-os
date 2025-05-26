// import { ChatOpenAI } from '@langchain/openai';
import { MessageContent, SuiteDatabaseCore } from '@getgrowly/core';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { agentPromptTemplate, beastModeDescription } from '../../agent/prompt';
import { AgentOptions, createAgent } from '../../agent/utils/agent.factory';
import { ChatProvider } from '../../agent/utils/model.factory';

export interface AgentChatRequest {
  message: string;
  agentId: string;
  userId: string;
}

export interface AgentChatResponse {
  agent: string;
  tools: MessageContent[];
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('GROWLY_SUITE_CORE') private readonly suiteCore: SuiteDatabaseCore
  ) {}

  // Use Langchain PromptTemplate for dynamic prompt construction
  private async getSystemPrompt(
    walletAddress: string,
    agentDescription: string,
    organizationName: string,
    organizationDescription: string,
    isBeastMode: boolean
  ): Promise<string> {
    const beastModePrompt = isBeastMode ? beastModeDescription : '';
    return (
      await agentPromptTemplate.invoke({
        walletAddress,
        agentDescription,
        organizationName,
        organizationDescription,
        beastModePrompt,
      })
    ).toString();
  }

  /**
   * Regular chat using the standard agent with persistence
   */
  async chat({ message, userId, agentId }: AgentChatRequest): Promise<AgentChatResponse> {
    this.logger.log(`Processing chat request for agent ${agentId} and user ${userId}`);

    const user = await this.suiteCore.db.users.getById(userId);
    const walletAddress = user?.entities?.['walletAddress'] || '';

    const agentDetails = await this.suiteCore.db.agents.getById(agentId);
    const organization = await this.suiteCore.db.organizations.getById(
      agentDetails?.organization_id || ''
    );

    if (!agentDetails || user?.entities?.['walletAddress'] === null) {
      throw new Error('Agent or wallet address not found');
    }

    const agentDescription = agentDetails.description || '';
    const organizationName = organization?.name || '';
    const organizationDescription = organization?.description || '';

    // Get provider from config
    const provider: ChatProvider =
      (this.configService.get('MODEL_PROVIDER') as ChatProvider) || 'openai';

    // Get system prompt
    const systemPrompt = await this.getSystemPrompt(
      walletAddress,
      agentDescription,
      organizationName,
      organizationDescription,
      true // TODO: Make this dynamic
    );

    // Create agent options
    const agentOptions: AgentOptions = {
      provider,
      agentId,
      systemPrompt,
      tools: {
        zerion: true,
        uniswap: true,
        tavily: true,
      },
      verbose: this.configService.get('MODEL_VERBOSE') === 'true',
    };

    // Get or create agent with persistence
    const agent = await createAgent(agentOptions, this.configService);

    // Stream the response with thread persistence
    const stream = await agent.stream(
      { messages: [{ content: message, role: 'user' }] },
      { configurable: { thread_id: `${agentId}-${userId}` } }
    );

    const response: AgentChatResponse = {
      agent: '',
      tools: [],
    };
    for await (const chunk of stream) {
      if ('tools' in chunk) {
        const messageContents: MessageContent[] = JSON.parse(chunk.tools.messages[0].content);
        const nonTextContents = messageContents.filter(content => content.type !== 'text');
        this.logger.debug(`[Tool chunk response]: ${JSON.stringify(nonTextContents)}`);
        response.tools.push(...nonTextContents);
      }
      if ('agent' in chunk) {
        this.logger.debug(`[Agent chunk response]: ${chunk.agent.messages[0].content}`);
        response.agent += chunk.agent.messages[0].content;
      }
    }
    return response;
  }

  /**
   * Regular chat using the beast mode agent
   */
  async advancedChat({ message, userId, agentId }: AgentChatRequest): Promise<AgentChatResponse> {
    return this.chat({ message, userId, agentId });
  }
}
