import { Redis } from '@upstash/redis';

export type TRPCContext = Awaited<ReturnType<typeof import('./init').createTRPCContext>>;

export function isTRPCDebugging() {
  return process.env.TRPC_DEBUG === '1' || process.env.TRPC_DEBUG === 'true';
}

let redisClient: Redis | null = null;
export function getUpstashRedisClient() {
  if (redisClient) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Upstash Redis env vars are not set');
  redisClient = new Redis({ url, token });
  return redisClient;
}

export function minutes(m: number) {
  return m * 60 * 1000;
}

export function withRedisCache<TInput, TOutput>(
  cacheKey: string,
  maxCacheTimeMilliseconds = minutes(10),
  queryFn: (params: { ctx: TRPCContext; input: TInput }) => Promise<TOutput>,
  options?: { shouldCache?: (result: TOutput) => boolean }
) {
  return async (params: { ctx: TRPCContext; input: TInput }): Promise<TOutput> => {
    const redis = getUpstashRedisClient();
    const maxCacheTimeSeconds = Math.floor(maxCacheTimeMilliseconds / 1000);

    const inputHash = JSON.stringify(params.input ?? {});
    const fullCacheKey = `trpc:${cacheKey}:${Buffer.from(inputHash).toString('base64url')}`;

    try {
      const cached = await redis.get<TOutput>(fullCacheKey);
      if (cached != null) {
        if (isTRPCDebugging()) console.log(`[TRPC Cache] HIT ${fullCacheKey}`);
        return cached as TOutput;
      }
    } catch (error) {
      if (isTRPCDebugging()) console.error(`[TRPC Cache] Redis error for key ${cacheKey}:`, error);
      return queryFn(params);
    }

    try {
      if (isTRPCDebugging()) console.log(`[TRPC Cache] MISS ${fullCacheKey}`);
      const result = await queryFn(params);
      const okToCache = options?.shouldCache ? options.shouldCache(result) : true;
      if (okToCache) {
        await redis.set(fullCacheKey, result, { ex: maxCacheTimeSeconds });
        if (isTRPCDebugging())
          console.log(`[TRPC Cache] SET ${fullCacheKey} ttl=${maxCacheTimeSeconds}s`);
      } else {
        if (isTRPCDebugging()) console.log(`[TRPC Cache] SKIP ${fullCacheKey}`);
      }
      return result;
    } catch (error) {
      console.error(`[TRPC Cache] Error executing query for key ${cacheKey}:`, error);
      throw error;
    }
  };
}
