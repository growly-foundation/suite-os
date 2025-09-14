import { Tables } from '@/types/database.types';

import { Agent } from './agents';
import { AggregatedWorkflow } from './workflows';

export type Organization = Tables<'organizations'>;
export type AggregatedOrganization = Organization & {
  workflows: AggregatedWorkflow[];
  agents: Agent[];
};

// Organization limits configuration
export const ORGANIZATION_LIMITS = {
  FREE_PLAN: {
    MAX_USERS: 500,
  },
} as const;

export interface OrganizationUserLimits {
  currentUserCount: number;
  maxUsers: number;
  canImport: boolean;
  availableSlots: number;
}

export interface ImportLimitCheckResult {
  canImport: boolean;
  maxAllowedImports: number;
  currentUserCount: number;
  maxUsers: number;
  exceedsLimit: boolean;
}
