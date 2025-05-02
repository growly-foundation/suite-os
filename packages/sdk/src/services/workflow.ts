import { Database } from '@/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Tables, TablesInsert, TablesUpdate } from '../database.types';

type Workflow = Tables<'workflows'>;
type WorkflowInsert = TablesInsert<'workflows'>;
type WorkflowUpdate = TablesUpdate<'workflows'>;

export class WorkflowService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(): Promise<Workflow[]> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getById(id: string): Promise<Workflow | null> {
    const { data, error } = await this.supabase.from('workflows').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(payload: WorkflowInsert): Promise<Workflow> {
    const { data, error } = await this.supabase.from('workflows').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: WorkflowUpdate): Promise<Workflow> {
    const { data, error } = await this.supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('workflows').delete().eq('id', id);
    if (error) throw error;
  }
}
