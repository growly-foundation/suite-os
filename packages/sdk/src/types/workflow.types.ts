import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { StepTable } from './step.types';

export type WorkflowTable = Tables<'workflows'>;
export type WorkflowInsert = TablesInsert<'workflows'>;
export type WorkflowUpdate = TablesUpdate<'workflows'>;
export type AggregatedWorkflow = WorkflowTable & { steps: StepTable[] };
