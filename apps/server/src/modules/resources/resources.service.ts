import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SUITE_CORE } from 'src/constants/services';
import { v4 as uuidv4 } from 'uuid';

import { types, utils } from '@getgrowly/chainsmith';
import { DocumentValue, SuiteDatabaseCore } from '@getgrowly/core';

import { SupabaseService } from '../databases/supabase.service';
import { EtherscanService } from '../etherscan/etherscan.service';
import { FirecrawlService } from '../firecrawl/firecrawl.service';
import {
  ExtractDescriptionDto,
  ExtractDescriptionResponseDto,
} from './dto/extract-description.dto';

@Injectable()
export class ResourcesService {
  private readonly storageBaseUrl: string;
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
    private readonly etherscanService: EtherscanService,
    private readonly firecrawlService: FirecrawlService,
    @Inject('OPENAI_CLIENT') private readonly openai: OpenAI,
    @Inject(SUITE_CORE) private readonly suiteDatabaseCore: SuiteDatabaseCore
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    this.storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/documents`;
  }

  async extractWebsiteDescription(
    dto: ExtractDescriptionDto
  ): Promise<ExtractDescriptionResponseDto> {
    try {
      this.logger.log(`Extracting description for website: ${dto.url}`);

      // Extract content using Firecrawl markdown format
      let scrapeResult: any;
      let content = '';
      let rawTitle = '';
      let rawDescription = '';

      try {
        scrapeResult = await this.firecrawlService.scrapeUrl(dto.url, {
          formats: ['markdown'],
          onlyMainContent: true,
        });

        if (this.configService.get<string>('NODE_ENV') !== 'production') {
          this.logger.debug(`Firecrawl markdown attempt for ${dto.url}:`, {
            success: scrapeResult.success,
            hasMarkdown: !!scrapeResult.markdown,
            markdownLength: scrapeResult.markdown ? scrapeResult.markdown.length : 0,
          });
        }

        if (scrapeResult.success) {
          // Extract from the root level of the response
          content = scrapeResult.markdown || '';
          rawTitle = scrapeResult.metadata?.title || '';
          rawDescription = scrapeResult.metadata?.description || '';
        }
      } catch (markdownError) {
        this.logger.debug(`Markdown extraction failed for ${dto.url}:`, markdownError.message);
      }

      // If no content with onlyMainContent, try without it
      if (!content || content.trim().length === 0) {
        try {
          scrapeResult = await this.firecrawlService.scrapeUrl(dto.url, {
            formats: ['markdown'],
            onlyMainContent: false,
          });

          this.logger.debug(`Firecrawl full content attempt for ${dto.url}:`, {
            success: scrapeResult.success,
            hasMarkdown: !!scrapeResult.markdown,
            hasMetadata: !!scrapeResult.metadata,
            markdownLength: scrapeResult.markdown ? scrapeResult.markdown.length : 0,
          });

          if (scrapeResult.success) {
            content = scrapeResult.markdown || content;
            rawTitle = scrapeResult.metadata?.title || rawTitle;
            rawDescription = scrapeResult.metadata?.description || rawDescription;
          }
        } catch (fullContentError) {
          this.logger.debug(
            `Full content extraction failed for ${dto.url}:`,
            fullContentError.message
          );
        }
      }

      this.logger.debug(`Final extracted content for ${dto.url}:`, {
        contentLength: content.length,
        hasTitle: !!rawTitle,
        hasDescription: !!rawDescription,
        title: rawTitle,
      });

      // If we still don't have content, check if we have at least metadata
      if (!content || content.trim().length === 0) {
        if (rawTitle || rawDescription) {
          this.logger.warn(`No content but have metadata for ${dto.url}, using metadata only`);
          return {
            description: rawDescription || rawTitle || 'Website resource',
            success: true,
          };
        } else {
          // Last resort: generate a basic description from the URL
          const urlObj = new URL(dto.url);
          const domain = urlObj.hostname.replace('www.', '');
          const basicDescription = `Website resource from ${domain}`;

          this.logger.warn(
            `No content or metadata extracted from ${dto.url}, using URL-based description`
          );
          return {
            description: basicDescription,
            success: true,
          };
        }
      }

      // Generate AI-enhanced description from the extracted content
      const description = await this.generateDescription(
        content,
        rawTitle,
        rawDescription,
        dto.url
      );

      this.logger.log(`Successfully extracted description for website: ${dto.url}`);

      return {
        description,
        success: true,
      };
    } catch (error: any) {
      this.logger.error(`Error extracting description for ${dto.url}:`, error);

      // Provide more specific error messages
      let userFriendlyMessage = 'Failed to extract website content';

      if (error.message?.includes('timeout')) {
        userFriendlyMessage = 'Website took too long to respond';
      } else if (error.message?.includes('network') || error.message?.includes('ENOTFOUND')) {
        userFriendlyMessage = 'Could not connect to the website';
      } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        userFriendlyMessage = 'Website blocked access (403 Forbidden)';
      } else if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        userFriendlyMessage = 'Website page not found (404)';
      } else if (error.message?.includes('rate limit')) {
        userFriendlyMessage = 'Too many requests - please try again later';
      }

      return {
        description: '',
        success: false,
        message: userFriendlyMessage,
      };
    }
  }

  private async generateDescription(
    content: string,
    rawTitle: string,
    rawDescription: string,
    url: string
  ): Promise<string> {
    try {
      const prompt = `
You are an AI assistant that helps create concise and informative descriptions for website links that will be used as resources.

Given the following website content and existing metadata, generate a clear and useful description that summarizes what this website/resource is about and why someone might want to reference it.

URL: ${url}
Title: ${rawTitle}
Original Description: ${rawDescription}

Content Preview:
${content}

Please provide a concise description (max 200 characters) that:
1. Clearly explains what this website/resource is about
2. Highlights the key value or information it provides
3. Is useful for someone deciding whether to visit this resource

Respond with just the description text, no JSON or formatting.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 100,
      });

      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      return responseContent.trim();
    } catch (error) {
      this.logger.warn('Failed to generate AI description, using fallback:', error);
      return rawDescription || rawTitle || 'Website resource';
    }
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
