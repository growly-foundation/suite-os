import { Database } from '@/types/database.types';
import { SupabaseClientService } from './supabase-client.service';

export type FnReturnType<Method extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][Method]['Returns'];

/**
 * Invoke an edge function in the database.
 */
export class FunctionService {
  constructor(private supabase: SupabaseClientService) {}

  async invoke<Method extends keyof Database['public']['Functions']>(
    method: Method,
    args: Database['public']['Functions'][Method]['Args']
  ): Promise<Database['public']['Functions'][Method]['Returns']> {
    const { data, error } = await this.supabase.getClient().rpc(method, args);
    if (error) throw error;
    return data;
  }
}
