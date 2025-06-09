import type {
  ApiError,
  TalentCredential,
  TalentProfile,
  TalentQueryParams,
  TalentScore,
} from '@/types';

export class TalentProtocolService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.talentprotocol.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'Unknown Error',
        message: `HTTP ${response.status}: ${response.statusText}`,
        status_code: response.status,
      }));
      throw new Error(`TalentProtocol API Error: ${errorData.message}`);
    }

    return response.json();
  }

  // Get the score and the credentials using wallet, scorer slug, talent id or account identifier
  async getCredentials(params: TalentQueryParams): Promise<TalentCredential[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('id', params.id);

    if (params.account_source) {
      searchParams.append('account_source', params.account_source);
    }
    if (params.slug) {
      searchParams.append('slug', params.slug);
    }
    if (params.scorer_slug) {
      searchParams.append('scorer_slug', params.scorer_slug);
    }

    const endpoint = `/credentials?${searchParams.toString()}`;
    const response = await this.makeRequest<{ credentials: TalentCredential[] }>(endpoint);
    return response.credentials;
  }

  // Get a profile using wallet, talent id or account identifier
  async getProfile(params: TalentQueryParams): Promise<TalentProfile> {
    const searchParams = new URLSearchParams();
    searchParams.append('id', params.id);

    if (params.account_source) {
      searchParams.append('account_source', params.account_source);
    }

    const endpoint = `/profile?${searchParams.toString()}`;
    const response = await this.makeRequest<{ profile: TalentProfile }>(endpoint);
    return response.profile;
  }

  // Get a specific score using wallet, scorer slug, talent id or account identifier
  async getScore(params: TalentQueryParams): Promise<TalentScore> {
    const searchParams = new URLSearchParams();
    searchParams.append('id', params.id);

    const endpoint = `/score?${searchParams.toString()}`;
    const response = await this.makeRequest<{ score: TalentScore }>(endpoint);
    return response.score;
  }
}
