import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { AggregatedWorkflow } from './workflow.types';

export type OrganizationTable = Tables<'organizations'>;
export type OrganizationInsert = TablesInsert<'organizations'>;
export type OrganizationUpdate = TablesUpdate<'organizations'>;
export type AggregatedOrganization = OrganizationTable & { workflows: AggregatedWorkflow[] };
