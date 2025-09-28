import { createClient } from 'redis';

export type ConnectRetryOptions = {
  maxRetries?: number;
  baseDelayMs?: number;
  connectTimeoutMs?: number;
};

export type RedisClient = ReturnType<typeof createClient>;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Connects to Redis with retry logic and timeout protection.
 *
 * Attempts to connect with exponential backoff between retries.
 * Each connection attempt is bounded by a timeout to prevent hanging.
 *
 * @param client - Redis client instance to connect
 * @param label - Identifier for logging purposes
 * @param options - Retry configuration options
 * @throws Error if all retry attempts fail or timeout is exceeded
 */
export async function connectWithRetry(
  client: RedisClient,
  label: string,
  { maxRetries = 5, baseDelayMs = 500, connectTimeoutMs = 1000 }: ConnectRetryOptions = {}
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let timeoutId: NodeJS.Timeout;
      await Promise.race([
        client.connect(),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error(`connect-timeout-${connectTimeoutMs}ms`)),
            connectTimeoutMs
          );
        }),
      ]).finally(() => {
        clearTimeout(timeoutId);
      });
      return;
    } catch (err) {
      console.error(`[redis:${label}] Failed to connect attempt ${attempt}/${maxRetries}`, err);
      if (attempt >= maxRetries) throw err;
      await sleep(baseDelayMs * attempt);
    }
  }
}

export function createConfiguredRedisClient(
  label: string,
  url: string = process.env.REDIS_URL ?? 'redis://localhost:6379'
): { client: RedisClient; url: string } {
  const client = createClient({ url });
  client.on('error', err => console.error(`[redis:${label}] error`, err));
  return { client, url } as const;
}

export async function safeQuit(client: RedisClient): Promise<void> {
  try {
    if ((client as unknown as { isOpen?: boolean }).isOpen) {
      await client.quit();
    }
  } catch {
    // ignore
  }
}

export async function usingRedis<T>(
  label: string,
  fn: (client: RedisClient) => Promise<T>,
  url: string = process.env.REDIS_URL ?? 'redis://localhost:6379',
  opts?: ConnectRetryOptions
): Promise<T> {
  const { client } = createConfiguredRedisClient(label, url);
  try {
    await connectWithRetry(client, label, opts);
    return await fn(client);
  } finally {
    await safeQuit(client);
  }
}
