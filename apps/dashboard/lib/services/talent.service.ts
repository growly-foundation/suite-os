/**
 * Etherscan API Service
 * Comprehensive service for interacting with Etherscan APIs across multiple chains
 */
import {
  TalentAccountSource,
  TalentConfig,
  TalentProfile,
  TalentQueryParams,
} from '@/types/talent';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class TalentService {
  private client: AxiosInstance;

  constructor(config: TalentConfig) {
    this.client = axios.create({
      baseURL: 'https://api.talentprotocol.com',
      timeout: config.timeout ?? 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
      },
    });
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
      const { data } = await this.client.get('/profile', requestConfig);

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
