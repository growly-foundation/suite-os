import { SERVER_API_URL } from '@/constants/config';
import axios from 'axios';

/**
 * Service to handle resource operations with the backend API
 */
export class ResourceService {
  /**
   * Upload a document file and return document metadata
   */
  static async uploadDocument(
    file: File,
    documentType: string
  ): Promise<{ documentUrl: string; documentType: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await axios.post(`${SERVER_API_URL}/resources/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }

  /**
   * Fetch contract ABI from address
   */
  static async getContractABI(address: string, network?: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${SERVER_API_URL}/resources/contract/${address}?network=${network}`
      );
      return response.data.abi;
    } catch (error) {
      console.error(`Failed to get contract ABI for address ${address}:`, error);
      throw error;
    }
  }
}
