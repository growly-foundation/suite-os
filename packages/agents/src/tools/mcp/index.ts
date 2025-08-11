import type { DynamicStructuredTool } from '@langchain/core/tools';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';

export type MCPServerName = 'coingecko' | (string & {});
export type MCPTransport = 'stdio' | 'sse' | 'streamableHttp';

export type MCPServerConfig =
  | {
      transport?: MCPTransport;
      command: string;
      args?: string[];
      env?: Record<string, string>;
      restart?: { enabled?: boolean; maxAttempts?: number; delayMs?: number };
      defaultToolTimeout?: number;
      enabledTools?: string[];
    }
  | {
      transport?: 'sse' | 'streamableHttp';
      url: string;
      headers?: Record<string, string>;
      automaticSSEFallback?: boolean;
      reconnect?: { enabled?: boolean; maxAttempts?: number; delayMs?: number };
      defaultToolTimeout?: number;
      enabledTools?: string[];
    };

export interface MCPToolsOptions {
  mcpServers: Partial<Record<MCPServerName, MCPServerConfig>>;
  throwOnLoadError?: boolean;
  prefixToolNameWithServerName?: boolean;
  additionalToolNamePrefix?: string;
  useStandardContentBlocks?: boolean;
  outputHandling?:
    | 'content'
    | 'artifact'
    | Partial<Record<'text' | 'image' | 'audio' | 'resource', 'content' | 'artifact'>>;
  defaultToolTimeout?: number;
}

export async function makeMcpTools(options: MCPToolsOptions): Promise<{
  tools: DynamicStructuredTool[];
  close: () => Promise<void>;
}> {
  const {
    mcpServers,
    throwOnLoadError = true,
    additionalToolNamePrefix = '',
    useStandardContentBlocks = true,
    outputHandling,
    defaultToolTimeout,
  } = options;

  const serverNames = Object.keys(mcpServers || {});
  const anyFilter = serverNames.some(name =>
    Boolean((mcpServers as any)[name]?.enabledTools?.length)
  );

  // Default to prefixing when multiple servers or when filtering is requested,
  // unless explicitly overridden by caller via options.prefixToolNameWithServerName
  const prefixToolNameWithServerName =
    options.prefixToolNameWithServerName ?? (serverNames.length > 1 || anyFilter);

  const client = new MultiServerMCPClient({
    mcpServers: mcpServers as any,
    throwOnLoadError,
    prefixToolNameWithServerName,
    additionalToolNamePrefix,
    useStandardContentBlocks,
    outputHandling: outputHandling as any,
    defaultToolTimeout,
  } as any);

  const tools = (await client.getTools()) as unknown as DynamicStructuredTool[];

  // Apply per-server filtering by server key (prefix when enabled)
  let filtered = tools;
  if (anyFilter) {
    const delimiter = '__';
    filtered = tools.filter(tool => {
      let serverPrefix: string | undefined;
      let baseName = tool.name;
      if (prefixToolNameWithServerName && tool.name.includes(delimiter)) {
        const [prefix, rest] = tool.name.split(delimiter, 2);
        serverPrefix = prefix;
        baseName = rest || baseName;
      }

      if (serverPrefix) {
        const cfg = (mcpServers as any)[serverPrefix] as MCPServerConfig | undefined;
        const enabled = (cfg as any)?.enabledTools as string[] | undefined;
        if (!enabled?.length) return true;
        return enabled.some(pattern => baseName.includes(pattern));
      }

      if (serverNames.length === 1) {
        const onlyCfg = (mcpServers as any)[serverNames[0]] as MCPServerConfig;
        const enabled = (onlyCfg as any)?.enabledTools as string[] | undefined;
        if (!enabled?.length) return true;
        return enabled.some(pattern => baseName.includes(pattern));
      }

      // Multiple servers without prefix: cannot reliably filter; keep tool
      return true;
    });
  }

  return { tools: filtered, close: async () => client.close() };
}
