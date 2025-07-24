import { SERVER_API_URL } from '@/constants/config';
import axios from 'axios';

import { ImportContractUserOutput, ImportPrivyUserOutput, ImportUserOutput } from '@getgrowly/core';

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

  static async importContractUsers(
    contractAddress: string,
    chainId: number
  ): Promise<ImportContractUserOutput[]> {
    try {
      const response = await axios.post(`${SERVER_API_URL}/user/import-contract`, {
        contractAddress,
        chainId,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to import contract users:', error);
      throw error;
    }
  }

  static async commitImportedUsers(
    users: ImportUserOutput[],
    organizationId: string
  ): Promise<{ success: any[]; failed: any[] }> {
    try {
      const response = await axios.post(`${SERVER_API_URL}/user/commit-imported-users`, {
        users,
        organizationId,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to import users:', error);
      throw error;
    }
  }
}
