// src/langchain/agent/agent.factory.ts
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ConfigService } from '@nestjs/config';
import { getProtocolTool } from '../tools/defillama/defillama';
import { makeTavilyTools } from '../tools/tavily';
import { makeZerionTools } from '../tools/zerion/zerion';
import { makeUniswapTools } from '../tools/growly/uniswap';
import { getCheckpointer } from './checkpointer';
import { ChatModelFactory, ChatProvider } from './model.factory';

/**
 * Interface for agent creation options
 */
export interface AgentOptions {
  provider?: ChatProvider;
  agentId: string;
  systemPrompt: string;
}

/**
 * Initializes and returns an instance of the AI agent with a dynamic system prompt.
 *
 * @param options The agent creation options
 * @param configService The NestJS config service
 * @returns The initialized AI agent
 */
export async function createAgent(
  options: AgentOptions,
  configService: ConfigService
): Promise<ReturnType<typeof createReactAgent>> {
  try {
    const { provider = 'openai', systemPrompt } = options;

    const llm = ChatModelFactory.create({ provider });
    // Use ConfigService for tool creation
    const { getPortfolioOverviewTool, getFungiblePositionsTool } = makeZerionTools(configService);
    const { rebalancePortfolioTool, portfolioAnalyzerTool, liquidityProviderTool } =
      makeUniswapTools(configService);
    const tavilySearchTool = makeTavilyTools(configService);
    const tools = [
      getPortfolioOverviewTool,
      getFungiblePositionsTool,
      rebalancePortfolioTool,
      portfolioAnalyzerTool,
      liquidityProviderTool,
      getProtocolTool,
      tavilySearchTool,
    ];
    const checkpointer = await getCheckpointer(configService);

    // Initialize Agent with optional checkpointer
    return createReactAgent({
      llm,
      tools,
      prompt: systemPrompt,
      checkpointSaver: checkpointer,
    });
  } catch (error) {
    console.error('Error initializing agent:', error);
    throw error;
  }
}
