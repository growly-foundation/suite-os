import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { RunnableSequence } from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
// import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { agentPromptTemplate } from './prompt';
import { getProtocolTool } from './tools/defillama/defillama';
import { getWebContentTool } from './tools/firecrawl/firecrawl';
import { makeZerionTools } from './tools/zerion/zerion';
import { createAgent } from './utils/agent.factory';
import { ChatProvider } from './utils/model.factory';
import { ChatBedrockConverse } from '@langchain/aws';
import { SuiteDatabaseCore } from '@growly/core';

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
    @Inject('GROWLY_SUITE_CORE') private readonly suiteCore: SuiteDatabaseCore,
  ) {}

  // Use Langchain PromptTemplate for dynamic prompt construction
  private async getSystemPrompt(walletAddress: string): Promise<string> {
    return (await agentPromptTemplate.invoke({ walletAddress })).toString();
  }

  /**
   * Regular chat using the standard agent
   */
  async chat({
    message,
    userId,
    agentId,
    useReactAgent = false,
  }: AgentChatRequest): Promise<string> {
    this.logger.log(
      `Processing chat request for agent ${agentId} and user ${userId}`,
    );

    if (useReactAgent) {
      return this.reactAgentChat({ message, userId, agentId, history: [] });
    }
    const user = await this.suiteCore.db.users.getById(userId);
    const walletAddress = user?.entities?.['walletAddress'] || '';

    // Original agent implementation
    const provider: ChatProvider =
      (this.configService.get('MODEL_PROVIDER') as ChatProvider) || 'openai';
    const systemPrompt = await this.getSystemPrompt(walletAddress);
    const agent = createAgent(provider, this.configService, systemPrompt);

    const stream = await agent.stream(
      { messages: [{ content: message, role: 'user' }] },
      { configurable: { thread_id: userId } },
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

  /**
   * Chat using the multi-agent supervisor architecture
   */
  async reactAgentChat({
    message,
    userId,
    agentId,
    history = [],
  }: SupervisorChatRequest): Promise<string> {
    this.logger.log(
      `Processing supervisor chat request for agent ${agentId} and user ${userId}`,
    );

    try {
      // Create supervisor graph
      const supervisor = this.createSupervisorGraph(userId, history);

      // Process with supervisor
      this.logger.log('Processing request with supervisor...');

      const result = await supervisor.invoke(new HumanMessage(message));

      if (result && typeof result.content === 'string') {
        return result.content;
      } else if (result && result.content) {
        return JSON.stringify(result.content);
      } else {
        this.logger.warn('No valid response from supervisor');
        return "I'm sorry, I couldn't process your request at this time.";
      }
    } catch (error) {
      this.logger.error(
        `Error in supervisor chat: ${error.message}`,
        error.stack,
      );
      return "I'm sorry, there was an error processing your request.";
    }
  }

  /**
   * Creates a multi-agent supervisor that coordinates between specialized sub-agents
   * @param userId The user ID for the conversation
   * @param history The conversation history
   * @returns The LangGraph supervisor agent
   */
  private createSupervisorGraph(userId: string, history: any[] = []) {
    // Initialize models

    // const llm = new ChatOpenAI({
    //   modelName: 'gpt-4o',
    //   temperature: 0.2,
    // });

    const llm = new ChatBedrockConverse({
      model: 'us.meta.llama3-3-70b-instruct-v1:0',
      temperature: 0.2,
      region: this.configService.get('BEDROCK_AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('BEDROCK_AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get(
          'BEDROCK_AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });

    // Initialize tools
    const { getPortfolioOverviewTool, getFungiblePositionsTool } =
      makeZerionTools(this.configService);

    // Define routing tools to sub-agents
    const walletPortfolioTool = new DynamicStructuredTool({
      name: 'get_wallet_portfolio',
      description: 'Get crypto wallet portfolio information using Zerion',
      schema: {
        type: 'object',
        properties: {
          walletAddress: {
            type: 'string',
            description: 'Ethereum wallet address to analyze',
          },
        },
        required: ['walletAddress'],
      },
      func: async ({ walletAddress }) => {
        // In a real implementation, this would route to the wallet agent
        // For now, directly use the tool
        try {
          const portfolioResult = await getPortfolioOverviewTool.invoke({
            walletAddress,
          });

          const positionsResult = await getFungiblePositionsTool.invoke({
            walletAddress,
          });

          return `## Wallet Portfolio Analysis
${portfolioResult}

## Token Holdings
${positionsResult}`;
        } catch (error) {
          return `Error getting wallet portfolio: ${error.message}`;
        }
      },
    });

    const protocolTool = new DynamicStructuredTool({
      name: 'get_protocol_info',
      description: 'Get DeFi protocol information using DefiLlama',
      schema: {
        type: 'object',
        properties: {
          protocolId: {
            type: 'string',
            description: 'Protocol identifier from DefiLlama (e.g. uniswap)',
          },
        },
        required: ['protocolId'],
      },
      func: async ({ protocolId }) => {
        try {
          return await getProtocolTool.invoke({ protocolId });
        } catch (error) {
          return `Error getting protocol info: ${error.message}`;
        }
      },
    });

    // Build system prompt with context
    const systemPrompt = `You are a multi-agent crypto and DeFi assistant that helps analyze wallet portfolios, protocols, and web information.
User ID: ${userId}

You have the following capabilities:
1. Analyze crypto wallet portfolios with Zerion data
2. Retrieve information about DeFi protocols with DeFiLlama
3. Extract web information (Note: Limited functionality)

Based on the user request, use the appropriate tools to provide comprehensive answers.
Always maintain a helpful, informative tone and acknowledge any limitations.
`;

    // Create history context
    const messages: BaseMessage[] = [new SystemMessage(systemPrompt)];

    // Add conversation history
    if (history && history.length > 0) {
      // Transform history to BaseMessage format
      history.forEach((msg) => {
        if (msg.sender === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.sender === 'assistant') {
          messages.push(new AIMessage(msg.content));
        }
      });
    }

    // Create the agent with all tools
    const agent = createReactAgent({
      llm,
      tools: [walletPortfolioTool, protocolTool, getWebContentTool],
      prompt: systemPrompt,
    });

    // Use a simpler approach without AgentExecutor
    return {
      invoke: async (message: HumanMessage) => {
        // Create a basic sequence
        const chain = RunnableSequence.from([
          (input: HumanMessage) => ({
            messages: [...messages, input],
          }),
          agent,
          (output: any) =>
            new AIMessage(output.messages[output.messages.length - 1].content),
        ]);

        // Run the chain
        try {
          return await chain.invoke(message);
        } catch (error) {
          this.logger.error('Error in agent:', error);
          return new AIMessage(
            'I encountered an error processing your request. Please try again.',
          );
        }
      },
    };
  }
}
