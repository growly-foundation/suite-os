import { DynamicStructuredTool } from '@langchain/core/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

import { getProtocolTool } from '../tools/defillama';
import type { MCPServerConfig, MCPServerName } from '../tools/mcp';
import { makeMcpTools } from '../tools/mcp';
import { makeResourceTools, setResourceContext } from '../tools/resources';
import { ResourceContext } from '../tools/resources/features/get-resource-details/core';
import {
  FirecrawlService,
  setFirecrawlService,
} from '../tools/resources/features/get-website-content/core';
import { makeTavilyTools } from '../tools/tavily';
import { makeUniswapTools } from '../tools/uniswap';
import { makeZerionTools } from '../tools/zerion';
import { getCheckpointer } from './checkpointer';
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

export interface MCPConfig {
  enabled?: boolean;
  servers?: Partial<Record<MCPServerName, MCPServerConfig>>;
  // Optional tuning for adapters
  throwOnLoadError?: boolean;
  prefixToolNameWithServerName?: boolean;
  additionalToolNamePrefix?: string;
  useStandardContentBlocks?: boolean;
  defaultToolTimeout?: number;
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
  mcp?: MCPConfig;
}

/**
 * Validates resource context to ensure data integrity
 */
function validateResources(resources: ResourceContext[]): ResourceContext[] {
  return resources.filter(resource => {
    // Basic validation
    if (!resource.id || !resource.name || !resource.type || !resource.value) {
      console.warn(`Invalid resource detected: ${JSON.stringify(resource)}`);
      return false;
    }

    // Type-specific validation
    switch (resource.type) {
      case 'link':
        if (!resource.value.url) {
          console.warn(`Link resource "${resource.name}" missing URL`);
          return false;
        }
        break;
      case 'contract':
        if (!resource.value.address || typeof resource.value.chainId !== 'number') {
          console.warn(`Contract resource "${resource.name}" missing address or chainId`);
          return false;
        }
        break;
      case 'document':
        if (!resource.value.documentName || !resource.value.documentType) {
          console.warn(`Document resource "${resource.name}" missing document name or type`);
          return false;
        }
        break;
      case 'text':
        if (!resource.value.content) {
          console.warn(`Text resource "${resource.name}" missing content`);
          return false;
        }
        break;
      default:
        console.warn(`Unknown resource type: ${resource.type}`);
        return false;
    }

    return true;
  });
}

const initializeTools = ({ zerion, uniswap, tavily, resources }: Partial<ToolsRegistry>) => {
  const tools: DynamicStructuredTool[] = [getProtocolTool];
  if (zerion) tools.push(...collectTools(makeZerionTools()));
  if (uniswap) tools.push(...collectTools(makeUniswapTools()));
  if (tavily) tools.push(...collectTools(makeTavilyTools()));
  if (resources) tools.push(...collectTools(makeResourceTools()));
  return tools;
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
  try {
    const { provider = 'openai', systemPrompt, verbose, resources, firecrawlService } = options;

    // Validate and set up resource context if provided
    let validatedResources: ResourceContext[] = [];
    if (resources && resources.length > 0) {
      validatedResources = validateResources(resources);

      if (validatedResources.length !== resources.length) {
        console.warn(
          `${resources.length - validatedResources.length} invalid resources were filtered out`
        );
      }

      if (validatedResources.length > 0) {
        // Use agent ID as context ID for better isolation
        const contextId = options.agentId || 'default';
        setResourceContext(validatedResources, contextId);

        console.log(
          `✅ Loaded ${validatedResources.length} valid resources for agent ${options.agentId}`
        );
      }
    }

    // Set up Firecrawl service if provided
    if (firecrawlService) {
      setFirecrawlService(firecrawlService);
      console.log('✅ Firecrawl service configured for website content extraction');
    }

    const llm = ChatModelFactory.create({ provider, verbose });

    // Initialize tools with resource support
    const toolsConfig = {
      ...options.tools,
      resources: validatedResources.length > 0,
    };

    const tools = initializeTools(toolsConfig);

    // Load MCP tools if configured
    let mcpClose: (() => Promise<void>) | undefined;
    if (options.mcp?.enabled && options.mcp?.servers && Object.keys(options.mcp.servers).length) {
      const { tools: mcpTools, close } = await makeMcpTools({
        mcpServers: options.mcp.servers,
        throwOnLoadError: options.mcp.throwOnLoadError,
        prefixToolNameWithServerName: options.mcp.prefixToolNameWithServerName,
        additionalToolNamePrefix: options.mcp.additionalToolNamePrefix,
        useStandardContentBlocks: options.mcp.useStandardContentBlocks ?? true,
        defaultToolTimeout: options.mcp.defaultToolTimeout,
      });
      mcpClose = close;
      tools.push(...mcpTools);
    }

    console.log(
      `🛠️ Initialized ${tools.length} tools for agent ${options.agentId}:`,
      tools.map(t => t.name).join(', ')
    );

    const checkpointer = await getCheckpointer();

    // Initialize Agent with optional checkpointer
    const agent = createReactAgent({
      llm,
      tools,
      prompt: systemPrompt,
      checkpointer: checkpointer as any,
    });

    // Best-effort cleanup when process exits if MCP was used
    if (mcpClose) {
      const cleanup = async () => {
        try {
          await mcpClose?.();
        } catch (_err) {
          // ignore cleanup errors
        }
      };
      // Avoid attaching multiple listeners if createAgent is called many times in a long-lived process
      process.once('exit', cleanup);
      process.once('SIGINT', cleanup as any);
      process.once('SIGTERM', cleanup as any);
    }

    return agent;
  } catch (error) {
    console.error(`Error initializing agent ${options.agentId}:`, error);
    throw error;
  }
}
