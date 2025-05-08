import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeSupabase();
  }

  private initializeSupabase() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabaseClient;
  }
}
