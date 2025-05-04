import { Database } from '@/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Tables, TablesInsert, TablesUpdate } from '../database.types';
import { v4 as uuidv4 } from 'uuid';

export type WorkflowTable = Tables<'workflows'>;
export type WorkflowInsert = TablesInsert<'workflows'>;
export type WorkflowUpdate = TablesUpdate<'workflows'>;

export class WorkflowService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(): Promise<WorkflowTable[]> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getById(id: string): Promise<WorkflowTable | null> {
    const { data, error } = await this.supabase.from('workflows').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(payload: Omit<WorkflowInsert, 'id'>): Promise<WorkflowTable> {
    const { data, error } = await this.supabase
      .from('workflows')
      .insert({
        id: `workflow-${uuidv4()}`,
        ...payload,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: WorkflowUpdate): Promise<WorkflowTable> {
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
