import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private _client: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }

    this._client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // Initialize the storage bucket if it doesn't exist
    await this.initializeStorage();
  }

  get client(): SupabaseClient {
    if (!this._client) {
      throw new Error('Supabase client not initialized');
    }
    return this._client;
  }

  private async initializeStorage() {
    try {
      // Check if 'documents' bucket exists
      const { data: buckets, error } = await this._client.storage.listBuckets();

      if (error) {
        this.logger.error('Error checking storage buckets:', error);
        return;
      }

      const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents');

      if (!documentsBucketExists) {
        // Create the documents bucket
        const { error: createError } = await this._client.storage.createBucket('documents', {
          public: true, // Make bucket public to allow direct access to files
          fileSizeLimit: 10485760, // 10MB limit
        });

        if (createError) {
          this.logger.error('Error creating documents bucket:', createError);
        } else {
          console.log('Created documents storage bucket');
        }
      }
    } catch (error) {
      this.logger.error('Error initializing storage:', error);
    }
  }
}
