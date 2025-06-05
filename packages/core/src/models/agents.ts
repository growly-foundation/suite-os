import { Tables } from '@/types/database.types';

import { ParsedResource } from './resources';
import { Workflow } from './workflows';

export type Agent = Tables<'agents'>;
export type AgentResource = Tables<'agent_resources'>;
export type AggregatedAgent = Agent & { workflows: Workflow[]; resources: ParsedResource[] };
