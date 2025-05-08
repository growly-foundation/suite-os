import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { AggregatedWorkflow } from './workflows';

export type Organization = Tables<'organizations'>;
export type OrganizationInsert = TablesInsert<'organizations'>;
export type OrganizationUpdate = TablesUpdate<'organizations'>;
export type AggregatedOrganization = Organization & { workflows: AggregatedWorkflow[] };
