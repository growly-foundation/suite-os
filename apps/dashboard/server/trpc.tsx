import { suiteCore } from '@/core/suite';
import { minutes } from '@/utils/time';
import { initTRPC } from '@trpc/server';
import SuperJSON from 'superjson';
import { ZodError } from 'zod';

import { isTRPCDebugging } from './redis-cache';
import { getUpstashRedisClient } from './redis/upstash-client';

/**
 * Type for the TRPC context.
 */
export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    core: suiteCore,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: SuperJSON,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  if (isTRPCDebugging()) console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Creates a cached wrapper for tRPC query procedures using Redis.
 * This function wraps a query implementation with Redis caching.
 *
 * @param cacheKey - The key to store the cached result under
 * @param maxCacheTimeSeconds - Maximum time to cache the result in seconds
 * @param queryFn - The original query function to cache
 * @returns Wrapped query function with caching
 *
 *
 * Usage Examples:
 *
 * export const exampleRouter = createTRPCRouter({
 *   expensiveQuery: publicProcedure
 *     .input(z.object({ userId: z.string() }))
 *     .query(
 *       withRedisCache(
 *         'expensive-data', // cache key
 *         600, // cache for 10 minutes
 *         async ({ ctx, input }) => {
 *           // Your expensive operation here
 *           return await performExpensiveOperation(input.userId);
 *         }
 *       )
 *     ),
 * });
 */
export function withRedisCache<TInput, TOutput>(
  cacheKey: string,
  maxCacheTimeMilliseconds = minutes(10),
  queryFn: (params: { ctx: TRPCContext; input: TInput }) => Promise<TOutput>,
  options?: { shouldCache?: (result: TOutput) => boolean }
) {
  return async (params: { ctx: TRPCContext; input: TInput }): Promise<TOutput> => {
    const redis = getUpstashRedisClient();
    const maxCacheTimeSeconds = maxCacheTimeMilliseconds / 1000;

    // Create a unique cache key that includes the input and custom key
    const inputHash = JSON.stringify(params.input);
    const fullCacheKey = `trpc:${cacheKey}:${Buffer.from(inputHash).toString('base64url')}`;

    try {
      // Try to get cached result
      const cached = await redis.get(fullCacheKey);
      if (cached) {
        if (isTRPCDebugging()) console.log(`[TRPC Cache] Cache HIT for key: ${fullCacheKey}`);
        return cached as TOutput;
      }
    } catch (error) {
      if (isTRPCDebugging()) console.error(`[TRPC Cache] Redis error for key ${cacheKey}:`, error);
      // If Redis fails, execute the query without caching
      return queryFn(params);
    }

    try {
      if (isTRPCDebugging()) console.log(`[TRPC Cache] Cache MISS for key: ${fullCacheKey}`);

      // Execute the original query function
      const result = await queryFn(params);

      // Cache the result unless shouldCache says otherwise
      const okToCache = options?.shouldCache ? options.shouldCache(result) : true;
      if (okToCache) {
        await redis.setex(fullCacheKey, maxCacheTimeSeconds, result);
        if (isTRPCDebugging())
          console.log(
            `[TRPC Cache] Cached result for key: ${fullCacheKey}, ttl: ${maxCacheTimeSeconds}s`
          );
      } else {
        if (isTRPCDebugging()) console.log(`[TRPC Cache] Skipped caching for key: ${fullCacheKey}`);
      }

      return result;
    } catch (error) {
      console.error(`[TRPC Cache] Error executing query for key ${cacheKey}:`, error);
      throw error;
    }
  };
}

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);
