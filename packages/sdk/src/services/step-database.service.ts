import { v4 as uuidv4 } from 'uuid';
import { StepInsert, StepTable, StepUpdate } from '@/types/step.types';
import { SupabaseClientService } from './supabase-client.service';

export class StepDatabaseService {
  constructor(private supabase: SupabaseClientService) {}

  async getAll(workflowId: string): Promise<StepTable[]> {
    if (!workflowId) throw new Error('Workflow ID is required');
    const query = this.supabase
      .getClient()
      .from('steps')
      .select('*')
      .order('created_at', { ascending: false })
      .eq('workflow_id', workflowId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getById(workflowId: string, id: string): Promise<StepTable | null> {
    if (!workflowId) throw new Error('Workflow ID is required');
    const { data, error } = await this.supabase
      .getClient()
      .from('steps')
      .select('*')
      .eq('id', id)
      .eq('workflow_id', workflowId)
      .single();
    if (error) throw error;
    return data;
  }

  async create(workflowId: string, payload: Omit<StepInsert, 'id'>): Promise<StepTable> {
    if (!workflowId) throw new Error('Workflow ID is required');
    const { data, error } = await this.supabase
      .getClient()
      .from('steps')
      .insert({ id: `step-${uuidv4()}`, ...payload })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(workflowId: string, id: string, updates: StepUpdate): Promise<StepTable> {
    if (!workflowId) throw new Error('Workflow ID is required');
    const { data, error } = await this.supabase
      .getClient()
      .from('steps')
      .update(updates)
      .eq('id', id)
      .eq('workflow_id', workflowId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(workflowId: string, id: string): Promise<void> {
    if (!workflowId) throw new Error('Workflow ID is required');
    const { error } = await this.supabase
      .getClient()
      .from('steps')
      .delete()
      .eq('id', id)
      .eq('workflow_id', workflowId);
    if (error) throw error;
  }
}
