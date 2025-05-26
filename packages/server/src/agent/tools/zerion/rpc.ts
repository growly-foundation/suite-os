import axios from 'axios';
import { ZERION_V1_BASE_URL } from './constants';
import { ConfigService } from '@nestjs/config';

export const getZerionAxiosInstance = (configService?: ConfigService) => {
  let headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (configService) {
    headers = {
      ...headers,
      Authorization: `Basic ${getEncodedKey(configService)}`,
    };
  }
  return axios.create({
    baseURL: ZERION_V1_BASE_URL,
    headers,
  });
};

// Factory function to get encoded key using ConfigService
export function getEncodedKey(configService: ConfigService): string {
  const apiKey = configService.get<string>('ZERION_API_KEY');
  if (!apiKey) {
    throw new Error('ZERION_API_KEY is not configured.');
  }
  return Buffer.from(`${apiKey}:`).toString('base64');
}
