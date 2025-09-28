import { Redis } from '@upstash/redis';

import { connectWithRetry, createConfiguredRedisClient } from './client';

// Alternatively: type UpstashLike = Pick<import('@upstash/redis').Redis, 'get' | 'setex'>;
// but not sure
type CacheRedisLike = {
  get: (key: string) => Promise<unknown>;
  setex: (key: string, ttlSeconds: number, value: unknown) => Promise<unknown>;
};

/**
 * Upstash Redis client for caching
 */
export const upstashRedis: Redis | undefined =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined;

/**
 * Return REST client when configured; otherwise fallback to TCP using
 * `UPSTASH_REDIS_TCP_URL` (or `REDIS_URL` as a final fallback).
 */
let tcpWrapper: CacheRedisLike | undefined;

function getTcpWrapper(): CacheRedisLike {
  if (tcpWrapper) return tcpWrapper;
  const tcpUrl = process.env.UPSTASH_REDIS_TCP_URL ?? process.env.REDIS_URL;
  const { client } = createConfiguredRedisClient('upstash-tcp-fallback', tcpUrl);
  const ready = connectWithRetry(client, 'upstash-tcp-fallback', {
    maxRetries: 5,
    baseDelayMs: 500,
    connectTimeoutMs: 1000,
  });

  tcpWrapper = {
    async get(key: string): Promise<unknown> {
      await ready;
      const val = await client.get(key);
      if (val == null) return null;
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    },
    async setex(key: string, ttlSeconds: number, value: unknown): Promise<unknown> {
      await ready;
      const serialized =
        typeof value === 'string' || typeof value === 'number'
          ? String(value)
          : JSON.stringify(value);
      return client.setEx(key, ttlSeconds, serialized);
    },
  };
  return tcpWrapper;
}

export function getUpstashRedisClient(): CacheRedisLike {
  if (upstashRedis) return upstashRedis as unknown as CacheRedisLike;
  console.warn('[Cache] Upstash REST not configured, falling back to TCP Redis');
  return getTcpWrapper();
}
