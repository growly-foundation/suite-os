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

  async getAll(
    limit?: number,
    orderBy?: {
      field: keyof Database['public']['Tables'][T]['Row'];
      ascending: boolean;
    }
  ): Promise<Database['public']['Tables'][T]['Row'][]> {
    const { data, error } = await this.withLimit(
      this.withOrderBy(
        this.getClient()
          .from(this.table as string)
          .select('*'),
        orderBy
      ),
      limit
    );
    if (error) throw error;
    return data!;
  }

  async getAllByFields(
    fields: Partial<Record<keyof Database['public']['Tables'][T]['Row'], string>>,
    limit?: number,
    orderBy?: {
      field: keyof Database['public']['Tables'][T]['Row'];
      ascending: boolean;
    }
  ): Promise<Database['public']['Tables'][T]['Row'][]> {
    const queryBuilder = this.getClient()
      .from(this.table as string)
      .select('*');

    for (const [field, value] of Object.entries(fields)) {
      queryBuilder.eq(field, value);
    }
    const { data, error } = await this.withOrderBy(this.withLimit(queryBuilder, limit), orderBy);
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
    const queryBuilder = this.getClient()
      .from(this.table as string)
      .select('*')
      .limit(1)
      .eq('id', id);
    const { data, error } = await queryBuilder.single();
    if (error) throw error;
    return data;
  }

  async getManyByIds(
    ids: string[],
    limit?: number,
    orderBy?: {
      field: keyof Database['public']['Tables'][T]['Row'];
      ascending: boolean;
    }
  ): Promise<Database['public']['Tables'][T]['Row'][]> {
    const queryBuilder = this.getClient()
      .from(this.table as string)
      .select('*')
      .in('id', ids);
    const { data, error } = await this.withLimit(this.withOrderBy(queryBuilder, orderBy), limit);
    if (error) throw error;
    return data;
  }

  async getManyByFields(
    field: keyof Database['public']['Tables'][T]['Row'],
    values: Database['public']['Tables'][T]['Row'][typeof field][],
    limit?: number,
    orderBy?: {
      field: keyof Database['public']['Tables'][T]['Row'];
      ascending: boolean;
    }
  ): Promise<Database['public']['Tables'][T]['Row'][]> {
    const queryBuilder = this.getClient()
      .from(this.table as string)
      .select('*')
      .in(field as string, values);
    const { data, error } = await this.withLimit(this.withOrderBy(queryBuilder, orderBy), limit);
    if (error) throw error;
    return data;
  }

  async getOneByFields(
    fields: Partial<Record<keyof Database['public']['Tables'][T]['Row'], string>>,
    orderBy?: {
      field: keyof Database['public']['Tables'][T]['Row'];
      ascending: boolean;
    }
  ): Promise<Database['public']['Tables'][T]['Row'] | null> {
    const queryBuilder = this.getClient()
      .from(this.table as string)
      .select('*');

    for (const [field, value] of Object.entries(fields)) {
      queryBuilder.eq(field, value);
    }
    const { data, error } = await this.withOrderBy(queryBuilder, orderBy).limit(1);
    if (error) throw error;
    return data?.[0] ?? null;
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

  async upsert(
    payload: Omit<Database['public']['Tables'][T]['Insert'], 'created_at'>,
    conflictTarget?: string | string[]
  ): Promise<Database['public']['Tables'][T]['Row']> {
    const onConflict = conflictTarget
      ? Array.isArray(conflictTarget)
        ? conflictTarget.join(',')
        : conflictTarget
      : undefined;

    const { data, error } = await this.getClient()
      .from(this.table as string)
      .upsert(payload as any, onConflict ? { onConflict } : undefined)
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

  withLimit(q: any, limit?: number) {
    if (!limit) return q;
    return q.limit(limit);
  }

  withOrderBy(
    q: any,
    orderBy?: {
      field: keyof Database['public']['Tables'][T]['Row'];
      ascending: boolean;
    }
  ) {
    if (!orderBy) return q;
    return q.order(orderBy.field as string, { ascending: orderBy.ascending });
  }
}
