import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_SUITE_API_URL || 'http://localhost:8080';

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

      const response = await axios.post(`${API_URL}/resources/documents/upload`, formData, {
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
        `${API_URL}/resources/contract/${address}?network=${network}`
      );
      return response.data.abi;
    } catch (error) {
      console.error(`Failed to get contract ABI for address ${address}:`, error);
      throw error;
    }
  }
}
