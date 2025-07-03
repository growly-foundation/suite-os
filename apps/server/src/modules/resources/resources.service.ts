import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as ethers from 'ethers';
import { SUITE_CORE } from 'src/constants/services';
import { v4 as uuidv4 } from 'uuid';

import { DocumentValue, SuiteDatabaseCore } from '@getgrowly/core';

import { SupabaseService } from '../databases/supabase.service';

@Injectable()
export class ResourcesService {
  private readonly storageBaseUrl: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
    @Inject(SUITE_CORE) private readonly suiteCore: SuiteDatabaseCore
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    this.storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/documents`;
  }

  async deleteResource(id: string) {
    // First check if it's a document and delete from storage if needed
    const resource = await this.suiteCore.db.resources.getById(id);
    if (
      resource &&
      resource.type === 'document' &&
      (resource.value as DocumentValue)?.documentUrl
    ) {
      const path = this.getPathFromUrl((resource.value as DocumentValue)?.documentUrl);
      if (path) {
        await this.deleteFile('documents', path);
      }
    }
    const { error } = await this.supabaseService.client.from('resources').delete().eq('id', id);
    if (error) {
      throw new Error(`Failed to delete resource: ${error.message}`);
    }
    return { success: true };
  }

  async uploadDocument(file: any, documentType: string) {
    // Validate file size (e.g., 10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.buffer.length > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type
    const allowedTypes = ['pdf', 'docx', 'csv', 'txt'];
    const fileExt = file.originalname.split('.').pop();
    if (!allowedTypes.includes(fileExt.toLowerCase())) {
      throw new Error(`File type ${fileExt} is not allowed`);
    }

    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await this.supabaseService.client.storage
      .from('documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }

    const fileUrl = `${this.storageBaseUrl}/${data.path}`;

    return {
      documentUrl: fileUrl,
      documentType,
    };
  }

  private async deleteFile(bucket: string, path: string) {
    const { error } = await this.supabaseService.client.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`Failed to delete file from storage: ${error.message}`);
    }
  }

  private getPathFromUrl(url: string): string | null {
    if (!url || !url.includes(this.storageBaseUrl)) {
      return null;
    }

    return url.replace(this.storageBaseUrl + '/', '');
  }

  async getContractABI(address: string, network = 'mainnet') {
    try {
      // Use Etherscan API or similar to fetch the contract ABI
      const apiKey = process.env.ETHERSCAN_API_KEY;
      let apiUrl: string;

      // Choose API URL based on network
      switch (network) {
        case 'sepolia':
          apiUrl = `https://api-sepolia.etherscan.io/api`;
          break;
        case 'goerli':
          apiUrl = `https://api-goerli.etherscan.io/api`;
          break;
        case 'polygon':
          apiUrl = `https://api.polygonscan.com/api`;
          break;
        case 'optimism':
          apiUrl = `https://api-optimistic.etherscan.io/api`;
          break;
        case 'base':
          apiUrl = `https://api.basescan.org/api`;
          break;
        default:
          apiUrl = `https://api.etherscan.io/api`; // Ethereum mainnet
      }

      const response = await axios.get(apiUrl, {
        params: {
          module: 'contract',
          action: 'getabi',
          address,
          apikey: apiKey,
        },
      });

      if (response.data.status === '1') {
        const abi = response.data.result;
        // Validate that the ABI is valid JSON
        try {
          const parsedAbi = JSON.parse(abi);
          return parsedAbi;
        } catch (error) {
          throw new Error('Invalid ABI format');
        }
      } else {
        throw new Error(`Etherscan API error: ${response.data.result}`);
      }
    } catch (error) {
      console.error('Error fetching contract ABI:', error);

      // Try fallback method: use ethers to get interface
      try {
        // This will only work if the contract follows a standard interface like ERC20, ERC721, etc.
        const provider = new ethers.JsonRpcProvider(this.getProviderUrl(network));
        const contract = new ethers.Contract(
          address,
          ['function symbol() view returns (string)'],
          provider
        );

        // Try to detect if it's an ERC20 or ERC721 contract
        const symbol = await contract.symbol();
        if (symbol) {
          // Return a basic interface
          return [
            {
              constant: true,
              inputs: [],
              name: 'name',
              outputs: [{ name: '', type: 'string' }],
              type: 'function',
            },
            {
              constant: true,
              inputs: [],
              name: 'symbol',
              outputs: [{ name: '', type: 'string' }],
              type: 'function',
            },
            {
              constant: true,
              inputs: [],
              name: 'decimals',
              outputs: [{ name: '', type: 'uint8' }],
              type: 'function',
            },
            {
              constant: true,
              inputs: [{ name: '_owner', type: 'address' }],
              name: 'balanceOf',
              outputs: [{ name: 'balance', type: 'uint256' }],
              type: 'function',
            },
          ];
        }
      } catch (fallbackError) {
        console.error('Fallback method failed:', fallbackError);
      }

      throw new Error('Could not retrieve contract ABI');
    }
  }

  private getProviderUrl(network: string): string {
    switch (network) {
      case 'sepolia':
        return 'https://sepolia.infura.io/v3/' + process.env.INFURA_KEY;
      case 'goerli':
        return 'https://goerli.infura.io/v3/' + process.env.INFURA_KEY;
      case 'polygon':
        return 'https://polygon-mainnet.infura.io/v3/' + process.env.INFURA_KEY;
      case 'optimism':
        return 'https://optimism-mainnet.infura.io/v3/' + process.env.INFURA_KEY;
      case 'base':
        return 'https://base-mainnet.infura.io/v3/' + process.env.INFURA_KEY;
      default:
        return 'https://mainnet.infura.io/v3/' + process.env.INFURA_KEY;
    }
  }
}
