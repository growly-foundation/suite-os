import axios from 'axios';

export interface PrivyUser {
  id: string;
  created_at: string;
  email?: string;
  phone?: string;
  wallet_addresses?: string[];
  linked_accounts?: Array<{
    type: string;
    handle: string;
  }>;
  profile?: {
    name?: string;
    avatar?: string;
  };
  custom_fields?: Record<string, any>;
}

export interface PrivyUsersResponse {
  data: PrivyUser[];
  next_cursor?: string;
}

export class PrivyService {
  private baseUrl = 'https://auth.privy.io/api/v1';
  private appId: string;
  private appSecret: string;

  constructor(appId: string, appSecret: string) {
    this.appId = appId;
    this.appSecret = appSecret;
  }

  /**
   * Get all users from Privy with optional pagination
   */
  async getUsers(cursor?: string, limit = 100): Promise<PrivyUsersResponse> {
    try {
      const url = new URL(`${this.baseUrl}/users`);

      if (cursor) {
        url.searchParams.append('next_cursor', cursor);
      }

      url.searchParams.append('limit', limit.toString());

      const response = await axios.get(url.toString(), {
        auth: {
          username: this.appId,
          password: this.appSecret,
        },
        headers: {
          'privy-app-id': this.appId,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching Privy users:', error);
      throw error;
    }
  }

  /**
   * Get a specific user by their ID
   */
  async getUser(userId: string): Promise<PrivyUser> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${userId}`, {
        auth: {
          username: this.appId,
          password: this.appSecret,
        },
        headers: {
          'privy-app-id': this.appId,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching Privy user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Validate API credentials by attempting to fetch users
   */
  async validateCredentials(): Promise<boolean> {
    try {
      await this.getUsers(undefined, 1);
      return true;
    } catch (error) {
      return false;
    }
  }
}
