// src/langchain/agent/agent.factory.ts
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatModelFactory, ChatProvider } from './model.factory';
import { MemorySaver } from '@langchain/langgraph';
import { makeZerionTools } from '../tools/zerion/zerion';
import { ConfigService } from '@nestjs/config';

let agent: ReturnType<typeof createReactAgent>;

/**
 * Initializes and returns an instance of the AI agent.
 * If an agent instance already exists, it returns the existing one.
 *
 * @function getOrInitializeAgent
 * @returns {ReturnType<typeof createReactAgent>} The initialized AI agent.
 *
 * @description Handles agent setup
 *
 * @throws {Error} If the agent initialization fails.
 */
export function createAgent(
  provider: ChatProvider = 'openai',
  configService: ConfigService,
): ReturnType<typeof createReactAgent> {
  // If agent has already been initialized, return it
  if (agent) {
    return agent;
  }

  try {
    const llm = ChatModelFactory.create({ provider });
    // Use ConfigService for tool creation
    const { getPortfolioOverviewTool, getFungiblePositionsTool } =
      makeZerionTools(configService);

    const tools = [getPortfolioOverviewTool, getFungiblePositionsTool];
    const memory = new MemorySaver();

    // Initialize Agent
    agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that expert in Web3 and Crypto, especially DeFi protocol.
        
        You can retrieve information from the blockchain about 3 main things with tools:
        - Portfolio and token holdings of a wallet address.
        - DeFi protocol information and total value locked (implementing soon).
        - Token details with its sentiment (implementing soon).
        
        If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so.
        
        Be concise and helpful with your responses. Refrain from 
        restating your tools' descriptions unless it is explicitly requested.
        `,
    });

    return agent;
  } catch (error) {
    console.error('Error initializing agent:', error);
    throw error;
  }
}
