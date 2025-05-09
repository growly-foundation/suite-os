import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseClientService {
  constructor(
    private supabaseUrl: string,
    private supabaseKey: string
  ) {}

  getClient(): SupabaseClient {
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    return supabase;
  }
}
