import axios from 'axios';

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

// Exponential backoff delay function
export const exponentialBackoff = (retryCount: number, baseDelay = 1000): number => {
  return baseDelay * Math.pow(2, retryCount - 1);
};

// Linear backoff delay function
export const linearBackoff = (retryCount: number, baseDelay = 1000): number => {
  return baseDelay * retryCount;
};

// Service-specific retry configurations
export const SERVICE_RETRY_CONFIGS = {
  // Zerion API - Retry on 429 rate limit errors
  ZERION_RATE_LIMIT: createRetryConfig(
    3,
    error => axios.isAxiosError(error) && error.response?.status === 429,
    exponentialBackoff
  ),

  // Etherscan API - Retry on rate limit errors with specific message
  ETHERSCAN_RATE_LIMIT: createRetryConfig(
    3,
    error => {
      if (!axios.isAxiosError(error) || !error.response?.data) return false;
      const data = error.response.data;
      return (
        data.status === '0' &&
        data.message === 'NOTOK' &&
        data.result?.includes('rate limit reached')
      );
    },
    retryCount => exponentialBackoff(retryCount, 2000) // Start with 2s base delay
  ),

  // Talent Protocol API - Retry on 404 errors
  TALENT_PROTOCOL_404: createRetryConfig(
    3,
    error => axios.isAxiosError(error) && error.response?.status === 404,
    linearBackoff
  ),
};
