import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

import { AgentOptions, createAgent } from '@getgrowly/agents';

import { CheckpointerService } from './checkpointer.service';

export interface CachedAgent {
  agent: Awaited<ReturnType<typeof createAgent>>;
  createdAt: Date;
  lastUsed: Date;
  configHash: string;
}

@Injectable()
export class AgentFactoryService {
  private readonly logger = new Logger(AgentFactoryService.name);
  private readonly agentCache = new Map<string, CachedAgent>();
  private readonly cacheTTL = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly maxCacheSize = 100; // Maximum number of cached agents

  constructor(private readonly checkpointerService: CheckpointerService) {}

  /**
   * Generate a hash for agent configuration to use as cache key
   */
  private generateConfigHash(options: AgentOptions): string {
    const configString = JSON.stringify({
      agentId: options.agentId,
      provider: options.provider || 'openai',
      systemPrompt: options.systemPrompt,
      tools: options.tools,
      resources: options.resources?.map(r => r.id).sort(),
    });

    return crypto.createHash('sha256').update(configString).digest('hex');
  }

  /**
   * Get or create an agent with caching
   */
  async getOrCreateAgent(options: AgentOptions): Promise<Awaited<ReturnType<typeof createAgent>>> {
    const configHash = this.generateConfigHash(options);
    const cacheKey = `${options.agentId}:${configHash}`;

    // Check cache
    const cached = this.agentCache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.createdAt.getTime();
      if (age < this.cacheTTL) {
        cached.lastUsed = new Date();
        this.logger.debug(
          `Using cached agent for ${options.agentId} (age: ${Math.round(age / 1000)}s)`
        );
        return cached.agent;
      } else {
        // Cache expired, remove it
        this.agentCache.delete(cacheKey);
        this.logger.debug(`Cache expired for agent ${options.agentId}`);
      }
    }

    // Clean up old entries if cache is full
    if (this.agentCache.size >= this.maxCacheSize) {
      this.cleanupCache();
    }

    // Create new agent
    this.logger.log(`Creating new agent for ${options.agentId}`);
    const checkpointer = await this.checkpointerService.getCheckpointer();

    const agent = await createAgent({
      ...options,
      checkpointer,
      logger: {
        log: (message: string) => this.logger.log(message),
        warn: (message: string) => this.logger.warn(message),
        error: (message: string, error?: any) => this.logger.error(message, error),
        debug: (message: string) => this.logger.debug(message),
      },
    });

    // Cache the agent
    this.agentCache.set(cacheKey, {
      agent,
      createdAt: new Date(),
      lastUsed: new Date(),
      configHash,
    });

    return agent;
  }

  /**
   * Invalidate agent cache for a specific agent ID
   */
  invalidateAgentCache(agentId: string): void {
    const keysToDelete: string[] = [];
    for (const [key, value] of this.agentCache.entries()) {
      if (key.startsWith(`${agentId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.agentCache.delete(key));
    this.logger.log(`Invalidated cache for ${keysToDelete.length} agent(s) with ID ${agentId}`);
  }

  /**
   * Clear all cached agents
   */
  clearCache(): void {
    const size = this.agentCache.size;
    this.agentCache.clear();
    this.logger.log(`Cleared ${size} cached agent(s)`);
  }

  /**
   * Clean up old cache entries (LRU eviction)
   */
  private cleanupCache(): void {
    const entries = Array.from(this.agentCache.entries())
      .map(([key, value]) => ({
        key,
        lastUsed: value.lastUsed.getTime(),
      }))
      .sort((a, b) => a.lastUsed - b.lastUsed);

    // Remove oldest 10% of entries
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
    for (let i = 0; i < toRemove; i++) {
      this.agentCache.delete(entries[i].key);
    }

    this.logger.debug(`Cleaned up ${toRemove} old cache entries`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    entries: Array<{ agentId: string; age: number; lastUsed: number }>;
  } {
    const entries = Array.from(this.agentCache.entries()).map(([key, value]) => {
      const [agentId] = key.split(':');
      return {
        agentId,
        age: Date.now() - value.createdAt.getTime(),
        lastUsed: Date.now() - value.lastUsed.getTime(),
      };
    });

    return {
      size: this.agentCache.size,
      maxSize: this.maxCacheSize,
      entries,
    };
  }
}
