import { WorkflowInsert, WorkflowTable, WorkflowUpdate } from '@/types/workflow.types';
import { SupabaseClientService } from './supabase-client.service';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowDatabaseService {
  constructor(private supabase: SupabaseClientService) {}

  async getAll(): Promise<WorkflowTable[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getById(id: string): Promise<WorkflowTable | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(payload: Omit<WorkflowInsert, 'id'>): Promise<WorkflowTable> {
    const { data, error } = await this.supabase
      .getClient()
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
      .getClient()
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.getClient().from('workflows').delete().eq('id', id);
    if (error) throw error;
  }
}
