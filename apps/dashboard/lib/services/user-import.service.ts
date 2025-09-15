import { SERVER_API_URL } from '@/constants/config';
import axios from 'axios';

import {
  ImportContractUserOutput,
  ImportLimitCheckResult,
  ImportNftHoldersOutput,
  ImportPrivyUserOutput,
  ImportUserOutput,
} from '@getgrowly/core';

export interface ImportJobStatus {
  jobId: string;
  organizationId: string;
  type: 'contract' | 'nft-holders' | 'privy' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  result?: {
    success: number;
    failed: number;
    errors?: string[];
  };
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

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

  static async importNftHolders(
    contractAddress: string,
    chainId: number
  ): Promise<ImportNftHoldersOutput[]> {
    try {
      const response = await axios.post(`${SERVER_API_URL}/user/import-nft-holders`, {
        contractAddress,
        chainId,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to import NFT holders:', error);
      throw error;
    }
  }

  static async checkOrganizationLimits(
    organizationId: string,
    usersToImport: number
  ): Promise<ImportLimitCheckResult> {
    try {
      const response = await axios.get(`${SERVER_API_URL}/user/organization-limits`, {
        params: { organizationId, usersToImport },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check organization limits:', error);
      throw error;
    }
  }

  static async getImportJobStatus(jobId: string): Promise<ImportJobStatus | null> {
    try {
      const response = await axios.get(`${SERVER_API_URL}/user/import-job-status`, {
        params: { jobId },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get job status:', error);
      throw error;
    }
  }

  static async getOrganizationJobs(organizationId: string): Promise<ImportJobStatus[]> {
    try {
      const response = await axios.get(`${SERVER_API_URL}/user/organization-jobs`, {
        params: { organizationId },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get organization jobs:', error);
      throw error;
    }
  }

  static async commitImportedUsers(
    users: ImportUserOutput[],
    organizationId: string,
    jobId?: string
  ): Promise<{ success: any[]; failed: any[] }> {
    try {
      const response = await axios.post(`${SERVER_API_URL}/user/commit-imported-users`, {
        users,
        organizationId,
        jobId,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to import users:', error);
      throw error;
    }
  }

  static async commitImportedUsersAsync(
    users: ImportUserOutput[],
    organizationId: string
  ): Promise<{ jobId: string; status: string }> {
    try {
      const response = await axios.post(
        `${SERVER_API_URL}/user/commit-imported-users-async`,
        {
          users,
          organizationId,
        },
        {
          timeout: 30000, // 30 second timeout for async job creation
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to start async import:', error);
      throw error;
    }
  }
}
