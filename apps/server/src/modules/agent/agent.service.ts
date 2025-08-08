import { AIMessageChunk } from '@langchain/core/messages';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AgentOptions,
  ChatProvider,
  RecommendationService,
  ResourceContext,
  agentPromptTemplate,
  beastModeDescription,
  createAgent,
} from '@getgrowly/agents';
import { MessageContent, SuiteDatabaseCore } from '@getgrowly/core';

import { SUITE_CORE } from '../../constants/services';
import { FirecrawlService } from '../firecrawl/firecrawl.service';

const buildThreadId = (agentId: string, userId: string) => `${agentId}-${userId}`;

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
    @Inject(SUITE_CORE) private readonly suiteCore: SuiteDatabaseCore,
    private readonly firecrawlService: FirecrawlService
  ) {}

  // Use Langchain PromptTemplate for dynamic prompt construction
  private async getSystemPrompt(
    walletAddress: string,
    agentDescription: string,
    organizationName: string,
    organizationDescription: string,
    resources: ResourceContext[],
    isBeastMode: boolean
  ): Promise<string> {
    const beastModePrompt = isBeastMode ? beastModeDescription : '';

    // Create resource summary for the prompt
    const resourceSummary =
      resources.length > 0
        ? `You have access to ${resources.length} resources. Use the resource tools with the ID to access their content:\n` +
          resources
            .map(
              r =>
                `- ${r.id}: ${r.name} (type: ${r.type}). \n  - Description: ${r.value.description || r.value.content || 'No description'}`
            )
            .join('\n')
        : 'No resources are currently attached to this agent.';

    return (
      await agentPromptTemplate.invoke({
        walletAddress,
        agentDescription,
        organizationName,
        organizationDescription,
        resources: resourceSummary,
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

    // Get agent resources
    const agentResourceIds = await this.suiteCore.db.agent_resources.getAllByFields({
      agent_id: agentId,
    });
    const resources = await this.suiteCore.db.resources.getManyByFields(
      'id',
      agentResourceIds.map(ar => ar.resource_id)
    );

    // Convert to ResourceContext format
    const resourceContext: ResourceContext[] = resources.map(resource => ({
      id: resource.id,
      name: resource.name,
      type: resource.type as ResourceContext['type'],
      value: resource.value,
    }));

    this.logger.debug(`🔍 [Resources]: ${resourceContext.length} resources attached`);

    // Get provider from config
    const provider: ChatProvider =
      (this.configService.get('MODEL_PROVIDER') as ChatProvider) || 'openai';

    // Get system prompt
    const systemPrompt = await this.getSystemPrompt(
      walletAddress,
      agentDescription,
      organizationName,
      organizationDescription,
      resourceContext,
      true // TODO: Make this dynamic
    );

    this.logger.debug(`🔍 [System prompt]: ${systemPrompt}`);

    // Create agent options with resource support
    const agentOptions: AgentOptions = {
      provider,
      agentId,
      systemPrompt,
      tools: {
        zerion: true,
        uniswap: true,
        tavily: true,
        resources: resourceContext.length > 0,
      },
      verbose: this.configService.get('MODEL_VERBOSE') === 'true',
      resources: resourceContext,
      firecrawlService: this.firecrawlService,
    };

    // Get or create agent with persistence
    const agent = await createAgent(agentOptions);

    // Stream the response with thread persistence
    const stream = await agent.stream(
      { messages: [{ content: message, role: 'user' }] },
      { configurable: { thread_id: buildThreadId(agentId, userId) } }
    );

    const response: AgentChatResponse = {
      agent: '',
      tools: [],
    };
    for await (const chunk of stream) {
      this.logger.debug(`🥩 [Chunk response]: ${JSON.stringify(chunk)}`);
      if ('tools' in chunk) {
        const rawContent = chunk.tools.messages[0].content;
        let messageContents: MessageContent[] = [];

        try {
          const parsedContent = JSON.parse(rawContent);
          // Check if parsedContent is an array, if not, wrap it in an array or skip
          if (Array.isArray(parsedContent)) {
            messageContents = parsedContent;
          } else {
            // If it's not an array, it might be a tool result object
            // Log it and continue without adding to tools
            this.logger.debug(`⚠️ [Non-array tool content]: ${JSON.stringify(parsedContent)}`);
            continue;
          }
        } catch (error) {
          this.logger.error(`Failed to parse tool content: ${error.message}`);
          continue;
        }

        const nonTextContents = messageContents.filter(content => content.type !== 'text');
        this.logger.debug(`⚒️ [Tool chunk response]: ${JSON.stringify(nonTextContents)}`);
        response.tools.push(...nonTextContents);
      }
      if ('agent' in chunk) {
        const messages: AIMessageChunk[] = chunk.agent.messages;
        const usage = messages[0].usage_metadata;
        this.logger.debug(`💳 [Usage metadata]: ${JSON.stringify(usage)}`);
        this.logger.debug(`🤖 [Agent chunk response]: ${messages[0].content}`);
        response.agent += messages[0].content;
      }
    }

    // Always generate recommendations using RecommendationService
    if (response.agent.trim()) {
      this.logger.debug('✨ [Generating recommendations]: Using RecommendationService directly');
      try {
        const recommendationService = new RecommendationService(provider, false);
        const recommendations = await recommendationService.generateRecommendations({
          userMessage: message,
          agentResponse: response.agent,
          agentCapabilities: [
            'Portfolio analysis with Zerion',
            'DeFi protocol information via DefiLlama',
            'Token swaps through Uniswap',
            'Crypto market research with Tavily',
            'Risk assessment and rebalancing',
            'Yield farming opportunities',
            'Resource access and content extraction',
          ],
        });

        if (
          recommendations.recommendations &&
          Object.keys(recommendations.recommendations).length > 0
        ) {
          response.tools.push({
            type: 'text:recommendation',
            content: recommendations.recommendations,
          });
          this.logger.debug(
            `✨ [Generated recommendations]: ${JSON.stringify(recommendations.recommendations)}`
          );
        }
      } catch (error) {
        this.logger.error(`Failed to generate recommendations: ${error.message}`);
      }
    }

    return response;
  }

  /**
   * Advanced chat with additional features
   */
  async advancedChat({ message, userId, agentId }: AgentChatRequest): Promise<AgentChatResponse> {
    // For now, use the same implementation as regular chat
    // This can be extended with additional features later
    return this.chat({ message, userId, agentId });
  }
}
