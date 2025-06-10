import type { TalentCredential, TalentProfile, TalentQueryParams, TalentScore } from '@/types';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class TalentProtocolService {
  private readonly apiClient: AxiosInstance;

  constructor(apiKey: string, baseUrl = 'https://api.talentprotocol.com') {
    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });
  }

  private async makeRequest<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const maxRetries = 3;
    let retries = 0;

    while (true) {
      try {
        const response = await this.apiClient.get<T>(endpoint, config);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Check if it's a 404 with "Resource not found" message
          // TalentProtocol API returns 404 if an address is not found, but creates a profile if it doesn't exist
          // We can retry a few times if it's a 404
          const is404NotFound =
            error.response?.status === 404 &&
            (error.response?.data?.message === 'Resource not found.' ||
              error.response?.data?.error === 'Resource not found.');

          // If it's a 404 "Resource not found" and we haven't exceeded max retries
          if (is404NotFound && retries < maxRetries) {
            retries++;
            console.log(`Retry attempt ${retries}/${maxRetries} for ${endpoint}...`);
            // Wait for increasing time between retries (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            continue;
          }

          console.error('Axios error:', error.response?.data || error.message);
          throw error;
        }
        console.error('Unexpected error:', error);
        throw error;
      }
    }
  }

  // Get the score and the credentials using wallet, scorer slug, talent id or account identifier
  async getCredentials(params: TalentQueryParams): Promise<TalentCredential[]> {
    const queryParams: Record<string, string> = {
      id: params.id,
    };

    if (params.account_source) {
      queryParams.account_source = params.account_source;
    }
    if (params.slug) {
      queryParams.slug = params.slug;
    }
    if (params.scorer_slug) {
      queryParams.scorer_slug = params.scorer_slug;
    }

    const response = await this.makeRequest<{ credentials: TalentCredential[] }>('/credentials', {
      params: queryParams,
    });
    return response.credentials;
  }

  // Get a profile using wallet, talent id or account identifier
  async getProfile(params: TalentQueryParams): Promise<TalentProfile> {
    const queryParams: Record<string, string> = {
      id: params.id,
    };

    if (params.account_source) {
      queryParams.account_source = params.account_source;
    }

    const response = await this.makeRequest<{ profile: TalentProfile }>('/profile', {
      params: queryParams,
    });
    return response.profile;
  }

  // Get a specific score using wallet, scorer slug, talent id or account identifier
  async getScore(params: TalentQueryParams): Promise<TalentScore> {
    const queryParams: Record<string, string> = {
      id: params.id,
    };

    const response = await this.makeRequest<{ score: TalentScore }>('/score', {
      params: queryParams,
    });
    return response.score;
  }
}
