import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export type ShouldRetryFn = (error: any) => boolean;
export type GetRetryDelayFn = (retryCount: number) => number;

export interface RetryConfig {
  maxRetries: number;
  shouldRetry: ShouldRetryFn;
  getRetryDelay: GetRetryDelayFn;
  onRetry?: (retryCount: number, maxRetries: number, endpoint?: string) => void;
}

export const linearBackoff = (retryCount: number, baseDelay = 1000): number => {
  return baseDelay * retryCount;
};

export const exponentialBackoff = (retryCount: number, baseDelay = 1000): number => {
  return baseDelay * Math.pow(2, retryCount - 1);
};

export abstract class BaseHttpService {
  protected client: AxiosInstance;

  constructor(config: { baseURL: string; timeout?: number; headers?: Record<string, string> }) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
      headers: config.headers ?? { 'Content-Type': 'application/json' },
    });
  }

  protected async requestWithRetry<T>(
    endpoint: string,
    config: AxiosRequestConfig,
    retryConfig: RetryConfig
  ): Promise<T> {
    let retries = 0;

    while (true) {
      try {
        const response = await this.client.request<T>({ url: endpoint, ...config });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyResponse: any = response as any;
        return (anyResponse.data ?? response) as T;
      } catch (error: any) {
        const shouldRetry = retryConfig.shouldRetry(error);

        if (shouldRetry && retries < retryConfig.maxRetries) {
          retries += 1;
          retryConfig.onRetry?.(retries, retryConfig.maxRetries, endpoint);
          const delay = retryConfig.getRetryDelay(retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }
  }
}
