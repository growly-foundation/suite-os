import { DynamicStructuredTool } from '@langchain/core/tools';
import { BaseCheckpointSaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { getProtocolTool } from '../tools/defillama';
import { makeResourceTools, setResourceContext } from '../tools/resources';
import { ResourceContext } from '../tools/resources/features/get-resource-details/core';
import {
  FirecrawlService,
  setFirecrawlService,
} from '../tools/resources/features/get-website-content/core';
import { makeTavilyTools } from '../tools/tavily';
import { makeUniswapTools } from '../tools/uniswap';
import { makeZerionTools } from '../tools/zerion';
import { ChatModelFactory, ChatProvider } from './model.factory';
import { collectTools } from './tools';

/**
 * Interface for tools registry
 */
export interface ToolsRegistry {
  zerion: boolean;
  uniswap: boolean;
  tavily: boolean;
  resources: boolean;
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
  resources?: ResourceContext[];
  firecrawlService?: FirecrawlService;
  checkpointer?: BaseCheckpointSaver;
  logger?: {
    log: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string, error?: any) => void;
    debug?: (message: string) => void;
  };
}

/**
 * Validates resource context to ensure data integrity
 */
function validateResources(resources: ResourceContext[]): ResourceContext[] {
  return resources.filter(resource => {
    // Basic validation
    if (!resource.id || !resource.name || !resource.type || !resource.value) {
      return false;
    }

    // Type-specific validation
    switch (resource.type) {
      case 'link':
        if (!resource.value.url) {
          return false;
        }
        break;
      case 'contract':
        if (!resource.value.address || typeof resource.value.chainId !== 'number') {
          return false;
        }
        break;
      case 'document':
        if (!resource.value.documentName || !resource.value.documentType) {
          return false;
        }
        break;
      case 'text':
        if (!resource.value.content) {
          return false;
        }
        break;
      default:
        return false;
    }

    return true;
  });
}

const initializeTools = ({
  zerion,
  uniswap,
  tavily,
  resources,
}: Partial<ToolsRegistry>): DynamicStructuredTool[] => {
  const tools: DynamicStructuredTool[] = [getProtocolTool];

  if (zerion) {
    tools.push(...collectTools(makeZerionTools()));
  }

  if (uniswap) {
    tools.push(...collectTools(makeUniswapTools()));
  }

  if (tavily) {
    tools.push(...collectTools(makeTavilyTools()));
  }

  if (resources) {
    tools.push(...collectTools(makeResourceTools()));
  }

  return tools;
};

/**
 * Default logger implementation
 */
const defaultLogger = {
  log: (message: string) => console.log(message),
  warn: (message: string) => console.warn(message),
  error: (message: string, error?: any) => console.error(message, error),
  debug: (message: string) => console.debug(message),
};

/**
 * Initializes and returns an instance of the AI agent with a dynamic system prompt.
 *
 * @param options The agent creation options
 * @returns The initialized AI agent
 */
export async function createAgent(
  options: AgentOptions
): Promise<ReturnType<typeof createReactAgent>> {
  const logger = options.logger || defaultLogger;

  try {
    const {
      provider = 'openai',
      systemPrompt,
      verbose,
      resources,
      firecrawlService,
      checkpointer,
      agentId,
    } = options;

    // Validate and set up resource context if provided
    let validatedResources: ResourceContext[] = [];
    if (resources && resources.length > 0) {
      validatedResources = validateResources(resources);

      if (validatedResources.length !== resources.length) {
        logger.warn(
          `${resources.length - validatedResources.length} invalid resources were filtered out`
        );
      }

      if (validatedResources.length > 0) {
        // Use agent ID as context ID for better isolation
        const contextId = agentId || 'default';
        setResourceContext(validatedResources, contextId);
        logger.log(`✅ Loaded ${validatedResources.length} valid resources for agent ${agentId}`);
      }
    }

    // Set up Firecrawl service if provided (still using global state for now)
    // TODO: Refactor tools to accept context via parameters
    if (firecrawlService) {
      setFirecrawlService(firecrawlService);
      logger.log('✅ Firecrawl service configured for website content extraction');
    }

    const llm = ChatModelFactory.create({ provider, verbose });

    // Initialize tools with resource support
    const toolsConfig = {
      ...options.tools,
      resources: validatedResources.length > 0,
    };

    const tools = initializeTools(toolsConfig);

    logger.log(
      `🛠️ Initialized ${tools.length} tools for agent ${agentId}: ${tools.map(t => t.name).join(', ')}`
    );

    if (!checkpointer) {
      throw new Error('Checkpointer is required but not provided');
    }

    // Initialize Agent with checkpointer
    return createReactAgent({
      llm,
      tools,
      prompt: systemPrompt,
      checkpointer,
    });
  } catch (error) {
    logger.error(`Error initializing agent ${options.agentId}:`, error);
    throw error;
  }
}
