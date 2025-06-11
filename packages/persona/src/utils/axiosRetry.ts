import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Generic retry configuration interface
export interface RetryConfig {
  maxRetries: number;
  shouldRetry?: (error: any) => boolean;
  getRetryDelay?: (retryCount: number) => number;
  onRetry?: (retryCount: number, maxRetries: number, endpoint: string) => void;
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  shouldRetry: error => {
    // Default: retry on network errors or 5xx server errors
    return axios.isAxiosError(error) && (!error.response || error.response.status >= 500);
  },
  getRetryDelay: retryCount => 1000 * retryCount, // Linear backoff
  onRetry: (retryCount, maxRetries, endpoint) => {
    console.log(`Retry attempt ${retryCount}/${maxRetries} for ${endpoint}...`);
  },
};

// Exponential backoff delay function
export const exponentialBackoff = (retryCount: number, baseDelay = 1000): number => {
  return baseDelay * Math.pow(2, retryCount - 1);
};

// Linear backoff delay function
export const linearBackoff = (retryCount: number, baseDelay = 1000): number => {
  return baseDelay * retryCount;
};

// Generic retry wrapper for HTTP requests
export async function makeRequestWithRetry<T>(
  apiClient: AxiosInstance,
  endpoint: string,
  config: AxiosRequestConfig = {},
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let retries = 0;

  while (true) {
    try {
      const response = await apiClient.request<T>({
        url: endpoint,
        method: 'GET',
        ...config,
      });
      return response.data;
    } catch (error) {
      // Check if we should retry this error
      const shouldRetry = retryConfig.shouldRetry?.(error) ?? false;

      if (shouldRetry && retries < retryConfig.maxRetries) {
        retries++;

        // Call retry callback if provided
        retryConfig.onRetry?.(retries, retryConfig.maxRetries, endpoint);

        // Wait before retrying (with configurable delay)
        const delay = retryConfig.getRetryDelay?.(retries) ?? 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // No retry or max retries exceeded, throw the error
      throw error;
    }
  }
}

// Convenience function for creating retry configs for specific error conditions
export function createRetryConfig(
  maxRetries: number,
  errorCondition: (error: any) => boolean,
  delayFunction?: (retryCount: number) => number
): RetryConfig {
  return {
    maxRetries,
    shouldRetry: errorCondition,
    getRetryDelay: delayFunction || linearBackoff,
    onRetry: DEFAULT_RETRY_CONFIG.onRetry,
  };
}

// Predefined retry configs for common scenarios
export const RETRY_CONFIGS = {
  // Retry on 404 "Resource not found" errors (useful for APIs that create resources on demand)
  TALENT_PROTOCOL_404: createRetryConfig(
    4,
    error => axios.isAxiosError(error) && error.response?.status === 404,
    exponentialBackoff
  ),

  // Retry on network errors and 5xx server errors
  NETWORK_AND_SERVER_ERRORS: createRetryConfig(
    3,
    error => axios.isAxiosError(error) && (!error.response || error.response.status >= 500)
  ),

  // Retry on rate limiting (429) and server errors
  RATE_LIMIT_AND_SERVER_ERRORS: createRetryConfig(
    5,
    error =>
      axios.isAxiosError(error) &&
      !!error.response &&
      (error.response.status === 429 || error.response.status >= 500),
    exponentialBackoff
  ),
};
