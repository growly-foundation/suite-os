// src/langchain/agent/agent.factory.ts
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatModelFactory, ChatProvider } from './model.factory';
import { MemorySaver } from '@langchain/langgraph';
import { makeZerionTools } from '../tools/zerion/zerion';
import { ConfigService } from '@nestjs/config';

/**
 * Initializes and returns an instance of the AI agent with a dynamic system prompt.
 *
 * @param provider The chat model provider
 * @param configService The NestJS config service
 * @param systemPrompt The system prompt to use for this agent instance
 * @returns The initialized AI agent
 */
export function createAgent(
  provider: ChatProvider = 'openai',
  configService: ConfigService,
  systemPrompt: string,
): ReturnType<typeof createReactAgent> {
  try {
    const llm = ChatModelFactory.create({ provider });
    // Use ConfigService for tool creation
    const { getPortfolioOverviewTool, getFungiblePositionsTool } =
      makeZerionTools(configService);

    const tools = [getPortfolioOverviewTool, getFungiblePositionsTool];
    const memory = new MemorySaver();

    // Initialize Agent
    return createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: systemPrompt,
    });
  } catch (error) {
    console.error('Error initializing agent:', error);
    throw error;
  }
}
