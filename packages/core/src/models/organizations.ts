import { Tables } from '@/types/database.types';
import { AggregatedWorkflow } from './workflows';
import { Agent } from './agents';

export type Organization = Tables<'organizations'>;
export type AggregatedOrganization = Organization & {
  workflows: AggregatedWorkflow[];
  agents: Agent[];
};
