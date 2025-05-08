import { SupabaseClientService } from './supabase-client.service';
import { Database } from '@/types/database.types';

export class PublicDatabaseService<T extends keyof Database['public']['Tables']> {
  constructor(
    private supabase: SupabaseClientService,
    private table: T
  ) {}

  private getClient() {
    return this.supabase.getClient().schema('public');
  }

  async getAll(): Promise<Database['public']['Tables'][T]['Row'][]> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data!;
  }

  async getAllByField(
    field: string,
    value: string
  ): Promise<Database['public']['Tables'][T]['Row'][]> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .select('*')
      .eq(field, value);

    if (error) throw error;
    return data!;
  }

  async getOne(): Promise<Database['public']['Tables'][T]['Row'] | null> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  }

  async getById(id: string): Promise<Database['public']['Tables'][T]['Row'] | null> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .select('*')
      .limit(1)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getByField(
    field: string,
    value: string
  ): Promise<Database['public']['Tables'][T]['Row'] | null> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .select('*')
      .limit(1)
      .eq(field, value)
      .single();

    if (error) throw error;
    return data;
  }

  async create(
    payload: Omit<Database['public']['Tables'][T]['Row'], 'id' | 'created_at'>
  ): Promise<Database['public']['Tables'][T]['Row']> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data!;
  }

  async update(
    id: string,
    updates: Partial<Database['public']['Tables'][T]['Row']>
  ): Promise<Database['public']['Tables'][T]['Row']> {
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
