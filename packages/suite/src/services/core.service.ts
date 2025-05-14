import { API_URL } from '@/constants';
import { SuiteDatabaseCore } from '@growly/core';
import axios from 'axios';

export class CoreService {
  constructor() {}

  /**
   * Call a service method
   * @param service Suite service name
   * @param method Service method name
   * @param args Method arguments
   * @returns
   */
  async call<T extends keyof SuiteDatabaseCore, R>(
    service: T,
    method: keyof SuiteDatabaseCore[T],
    args?: any[]
  ): Promise<R> {
    try {
      const response = await axios.post(
        `${API_URL}/core/call`,
        {
          service,
          method,
          args,
        },
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

  async callDatabaseService<T extends keyof SuiteDatabaseCore['db'], R>(
    method: T,
    args?: any[]
  ): Promise<R> {
    try {
      const response = await axios.post(
        `${API_URL}/core/call-db`,
        {
          method,
          args,
        },
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

export const suiteCoreService = new CoreService();
