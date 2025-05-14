import { Database } from '@/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export class PublicDatabaseService<T extends keyof Database['public']['Tables']> {
  constructor(
    private supabase: SupabaseClient,
    private table: T
  ) {}

  private getClient() {
    return this.supabase.schema('public');
  }

  async getAll(): Promise<Database['public']['Tables'][T]['Row'][]> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data!;
  }

  async getAllByFields(
    fields: Partial<Record<keyof Database['public']['Tables'][T]['Row'], string>>
  ): Promise<Database['public']['Tables'][T]['Row'][]> {
    const queryBuilder = this.getClient()
      .from(this.table as string)
      .select('*');

    for (const [field, value] of Object.entries(fields)) {
      queryBuilder.eq(field, value);
    }
    const { data, error } = await queryBuilder.order('created_at', { ascending: true });

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

  async getManyByIds(ids: string[]): Promise<Database['public']['Tables'][T]['Row'][]> {
    const { data, error } = await this.getClient()
      .from(this.table as string)
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return data;
  }

  async getOneByFields(
    fields: Partial<Record<keyof Database['public']['Tables'][T]['Row'], string>>
  ): Promise<Database['public']['Tables'][T]['Row'] | null> {
    const queryBuilder = this.getClient()
      .from(this.table as string)
      .select('*');

    for (const [field, value] of Object.entries(fields)) {
      queryBuilder.eq(field, value);
    }
    const { data, error } = await queryBuilder.order('created_at', { ascending: true }).single();

    if (error) {
      console.error(error);
      return null;
    }
    return data!;
  }

  async create(
    payload: Omit<Database['public']['Tables'][T]['Insert'], 'created_at'>
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
    updates: Partial<Database['public']['Tables'][T]['Update']>
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

  async deleteByFields(
    fields: Partial<Record<keyof Database['public']['Tables'][T]['Row'], string>>
  ): Promise<void> {
    const queryBuilder = this.getClient()
      .from(this.table as string)
      .delete();

    for (const [field, value] of Object.entries(fields)) {
      queryBuilder.eq(field, value);
    }
    const { error } = await queryBuilder;

    if (error) throw error;
  }
}
