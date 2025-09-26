/**
 * Talent Protocol API Service
 * Service for interacting with Talent Protocol APIs
 */
import {
  TalentAccountSource,
  TalentConfig,
  TalentProfile,
  TalentQueryParams,
} from '@/types/talent';
import { AxiosRequestConfig } from 'axios';

import { BaseHttpService, RetryConfig, linearBackoff } from './base-http.service';

export class TalentService extends BaseHttpService {
  constructor(config: TalentConfig) {
    super({
      baseURL: 'https://api.talentprotocol.com',
      timeout: config.timeout ?? 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
      },
    });
  }

  private get notFoundRetryConfig(): RetryConfig {
    return {
      maxRetries: 3,
      shouldRetry: error => !!error?.response && error.response.status === 404,
      getRetryDelay: retryCount => linearBackoff(retryCount, 1000),
      onRetry: (retryCount, maxRetries, endpoint) => {
        console.warn(
          `Talent Protocol 404. Retrying ${retryCount}/${maxRetries}${endpoint ? ` ${endpoint}` : ''}`
        );
      },
    };
  }

  async getProfile(params: TalentQueryParams): Promise<TalentProfile> {
    const query: Record<string, string> = {};

    switch (params.account_source) {
      case 'wallet':
        query.wallet = params.id;
        break;
      case 'farcaster':
      case 'github':
        query.account_identifier = params.id;
        break;
      default:
        // Assume raw talent id when no source provided
        query.id = params.id;
    }

    if (params.slug) query.slug = params.slug;
    if (params.scorer_slug) query.scorer_slug = params.scorer_slug;

    const requestConfig: AxiosRequestConfig = { params: query };

    try {
      const data = await this.requestWithRetry<any>(
        '/profile',
        requestConfig,
        this.notFoundRetryConfig
      );

      const profile = (data?.profile ?? data) as TalentProfile;
      return profile;
    } catch (error) {
      console.error('Error fetching talent profile:', error);
      throw error;
    }
  }

  async getProfileByWallet(wallet: string): Promise<TalentProfile> {
    return this.getProfile({ id: wallet, account_source: 'wallet' });
  }

  async getProfileByTalentId(talentId: string): Promise<TalentProfile> {
    return this.getProfile({ id: talentId });
  }

  async getProfileByAccount(
    identifier: string,
    source: Exclude<TalentAccountSource, 'wallet'>
  ): Promise<TalentProfile> {
    return this.getProfile({ id: identifier, account_source: source });
  }
}
