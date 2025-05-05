import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseClientService {
  constructor(
    private supabaseUrl: string,
    private supabaseKey: string
  ) {}

  getClient(): SupabaseClient {
    return createClient(this.supabaseUrl, this.supabaseKey);
  }
}
