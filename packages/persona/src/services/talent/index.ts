import type {
  Address,
  TalentCredential,
  TalentProfile,
  TalentQueryParams,
  TalentScore,
  TalentSocialAccount,
  WalletTalentData,
} from '@/types';
import { RETRY_CONFIGS, type RetryConfig, makeRequestWithRetry } from '@/utils/axiosRetry';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class TalentProtocolService {
  private readonly apiClient: AxiosInstance;
  private readonly retryConfig: RetryConfig;

  constructor(apiKey: string, baseUrl: string, retryConfig: Partial<RetryConfig> = {}) {
    // Use the predefined TalentProtocol retry config as default
    this.retryConfig = { ...RETRY_CONFIGS.TALENT_PROTOCOL_404, ...retryConfig };

    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
    });

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      error => {
        console.error('TalentProtocol API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Use the generic makeRequest method with configurable retry logic
  private async makeRequest<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return makeRequestWithRetry<T>(this.apiClient, endpoint, config, this.retryConfig);
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

  //
  async getSocialAccounts(params: TalentQueryParams): Promise<TalentSocialAccount[]> {
    const queryParams: Record<string, string> = {
      id: params.id,
    };

    const response = await this.makeRequest<{ accounts: TalentSocialAccount[] }>('/accounts', {
      params: queryParams,
    });
    return response.accounts;
  }

  async getAggregatedWalletData(walletAddress: Address): Promise<WalletTalentData> {
    // Fetch user profile
    const profile = await this.getProfile({ id: walletAddress });
    if (!profile) throw new Error('Profile not found');

    const score = await this.getScore({ id: walletAddress });
    const socialAccounts = await this.getSocialAccounts({ id: walletAddress });

    return {
      profile,
      score,
      socialAccounts,
    };
  }
}
