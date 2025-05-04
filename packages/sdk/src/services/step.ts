import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables, TablesInsert, TablesUpdate } from '../database.types';
import { v4 as uuidv4 } from 'uuid';

export type StepTable = Tables<'steps'>;
export type StepInsert = TablesInsert<'steps'>;
export type StepUpdate = TablesUpdate<'steps'>;

export class StepService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(workflowId?: string): Promise<StepTable[]> {
    let query = this.supabase.from('steps').select('*').order('created_at', { ascending: false });

    if (workflowId) {
      query = query.eq('workflow_id', workflowId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getById(id: string): Promise<StepTable | null> {
    const { data, error } = await this.supabase.from('steps').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(payload: Omit<StepInsert, 'id'>): Promise<StepTable> {
    const { data, error } = await this.supabase
      .from('steps')
      .insert({ id: `step-${uuidv4()}`, ...payload })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: StepUpdate): Promise<StepTable> {
    const { data, error } = await this.supabase
      .from('steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('steps').delete().eq('id', id);
    if (error) throw error;
  }
}
