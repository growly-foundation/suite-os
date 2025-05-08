import { Provider } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

export const SupabaseProvider: Provider = {
  provide: 'SUPABASE_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService): SupabaseClient => {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseKey = configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    return createClient(supabaseUrl, supabaseKey);
  },
};
