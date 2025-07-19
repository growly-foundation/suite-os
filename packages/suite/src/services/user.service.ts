import { API_URL } from '@/constants';
import axios from 'axios';

import { ParsedUser, ParsedUserPersona } from '@getgrowly/core';

export class UserService {
  constructor() {}

  async createUserIfNotExist(walletAddress: string, organizationId: string): Promise<ParsedUser> {
    try {
      const response = await axios.post(
        `${API_URL}/user`,
        { walletAddress, organizationId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPersona(walletAddress: string): Promise<ParsedUserPersona | null> {
    try {
      const response = await axios.post(
        `${API_URL}/user/persona`,
        { walletAddress },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const userService = new UserService();
