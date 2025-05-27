// src/langchain/agent/agent.factory.ts
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ConfigService } from '@nestjs/config';
import { getProtocolTool } from '../tools/defillama';
import { makeTavilyTools } from '../tools/tavily';
import { makeZerionTools } from '../tools/zerion';
import { makeUniswapTools } from '../tools/uniswap';
import { getCheckpointer } from './checkpointer';
import { ChatModelFactory, ChatProvider } from './model.factory';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { collectTools } from './tools';

/**
 * Interface for tools registry
 */
export interface ToolsRegistry {
  zerion: boolean;
  uniswap: boolean;
  tavily: boolean;
}

/**
 * Interface for agent creation options
 */
export interface AgentOptions {
  provider?: ChatProvider;
  agentId: string;
  systemPrompt: string;
  tools?: Partial<ToolsRegistry>;
  verbose?: boolean;
}

const initializeTools = (
  configService: ConfigService,
  { zerion, uniswap, tavily }: Partial<ToolsRegistry>
) => {
  const tools: DynamicStructuredTool[] = [getProtocolTool];
  if (zerion) tools.push(...collectTools(makeZerionTools(configService)));
  if (uniswap) tools.push(...collectTools(makeUniswapTools(configService)));
  if (tavily) tools.push(...collectTools(makeTavilyTools(configService)));
  return tools;
};

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
    const { provider = 'openai', systemPrompt, verbose } = options;

    const llm = ChatModelFactory.create({ provider, verbose });
    // Use ConfigService for tool creation
    const tools = initializeTools(configService, options.tools || {});
    const checkpointer = await getCheckpointer(configService);

    // Initialize Agent with optional checkpointer
    return createReactAgent({
      llm,
      tools,
      prompt: systemPrompt,
      checkpointer,
    });
  } catch (error) {
    console.error('Error initializing agent:', error);
    throw error;
  }
}
