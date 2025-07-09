import { SERVER_API_URL } from '@/constants/config';
import axios from 'axios';

import { ImportPrivyUserOutput, ImportUserOutput, UserImportSource } from '@getgrowly/core';

/**
 * Service for handling user imports from external sources
 */
export class UserImportService {
  static async importPrivyUsers(
    appId: string,
    appSecret: string
  ): Promise<ImportPrivyUserOutput[]> {
    try {
      const response = await axios.post(`${SERVER_API_URL}/user/import-privy`, {
        appId,
        appSecret,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to import privy users:', error);
      throw error;
    }
  }

  static async importBatch(
    source: UserImportSource,
    users: ImportUserOutput[]
  ): Promise<{ success: any[]; failed: any[] }> {
    try {
      const response = await axios.post(`${SERVER_API_URL}/user/import-batch`, {
        source,
        users,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to import users:', error);
      throw error;
    }
  }
}
