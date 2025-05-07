import { SupabaseClientService } from './supabase-client.service';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@/types';

export class AuthDatabaseService<T extends keyof Database['next_auth']['Tables']> {
  constructor(
    private supabase: SupabaseClientService,
    private table: T
  ) {}

  private getClient() {
    return this.supabase.getClient().schema('next_auth');
  }

  async getAll(): Promise<Database['next_auth']['Tables'][T]['Row'][]> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data!;
  }

  async getById(id: string): Promise<Database['next_auth']['Tables'][T]['Row'] | null> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(
    payload: Omit<Database['next_auth']['Tables'][T]['Row'], 'id' | 'created_at' | 'updated_at'>
  ): Promise<Database['next_auth']['Tables'][T]['Row']> {
    const insertPayload = {
      id: `${String(this.table)}-${uuidv4()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...payload,
    };

    const { data, error } = await this.getClient()
      .from(this.table as string)
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;
    return data!;
  }

  async update(
    id: string,
    updates: Partial<Database['next_auth']['Tables'][T]['Row']>
  ): Promise<Database['next_auth']['Tables'][T]['Row']> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data!;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.getClient()
      .from(this.table as string)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
