import { Tables } from '@/types/database.types';

import { Agent } from './agents';
import { AggregatedWorkflow } from './workflows';

export type Organization = Tables<'organizations'>;
export type AggregatedOrganization = Organization & {
  workflows: AggregatedWorkflow[];
  agents: Agent[];
};

// Organization limits configuration (mock)
// TODO: Finalize and add to database when actual pricing model is implemented
export const ORGANIZATION_LIMITS = {
  FREE_PLAN: {
    MAX_USERS: 500,
    MAX_IMPORTS_PER_DAY: 100, // Add rate limiting
    MAX_BATCH_SIZE: 100, // Add batch size limits
  },
  STARTER_PLAN: {
    MAX_USERS: 5000,
    MAX_IMPORTS_PER_DAY: 500,
    MAX_BATCH_SIZE: 500,
  },
  ENTERPRISE_PLAN: {
    MAX_USERS: -1, // Unlimited
    MAX_IMPORTS_PER_DAY: -1,
    MAX_BATCH_SIZE: 1000,
  },
} as const;

export type OrganizationPlan = keyof typeof ORGANIZATION_LIMITS;

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
