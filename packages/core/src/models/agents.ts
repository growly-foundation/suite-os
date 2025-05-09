import { Tables } from '@/types/database.types';
import { WorkflowId } from './ids';

export type Agent = Tables<'agents'>;
export type AggregatedAgent = Agent & { workflows: WorkflowId[] };
