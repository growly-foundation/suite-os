import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SUITE_CORE } from 'src/constants/services';
import { v4 as uuidv4 } from 'uuid';

import { types, utils } from '@getgrowly/chainsmith';
import { DocumentValue, SuiteDatabaseCore } from '@getgrowly/core';

import { SupabaseService } from '../databases/supabase.service';
import { EtherscanService } from '../etherscan/etherscan.service';

@Injectable()
export class ResourcesService {
  private readonly storageBaseUrl: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
    private readonly etherscanService: EtherscanService,
    @Inject(SUITE_CORE) private readonly suiteDatabaseCore: SuiteDatabaseCore
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    this.storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/documents`;
  }

  async deleteResource(id: string) {
    // First check if it's a document and delete from storage if needed
    const resource = await this.suiteDatabaseCore.db.resources.getById(id);
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
      const chainId = utils.getChainIdByName(network as types.TChainName);
      return await this.etherscanService.getContractABI(address, chainId);
    } catch (error) {
      throw new Error(`Failed to get contract ABI: ${error.message}`);
    }
  }
}
