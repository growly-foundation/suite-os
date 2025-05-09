import { growlySuiteSdk } from '@/core/sdk';
import { AggregatedWorkflow } from '@growly/core';
import { create } from 'zustand';
import { OrganizationTable, UserTable } from '@growly/core';

/**
 * State storage for managing application state.
 */
export type DashboardAppState = {
  // Authentication
  user: UserTable | null;
  setUser: (user: UserTable | null) => void;

  // Organizations
  fetchOrganizations: () => Promise<void>;
  organizations: OrganizationTable[];
  setOrganizations: (organizations: OrganizationTable[]) => void;

  // Selected Organization
  selectedOrganization: OrganizationTable | null;
  setSelectedOrganization: (organization: OrganizationTable) => void;

  // Workflows
  workflows: AggregatedWorkflow[];
  getWorkflow: (workflowId: string) => AggregatedWorkflow | undefined;
  setWorkflows: (workflows: AggregatedWorkflow[]) => void;
  fetchWorkflows: () => Promise<void>;

  // Steps
  fetchSteps: (workflowId: string) => Promise<void>;
};

/**
 * Hook for managing application state.
 */
export const useDashboardState = create<DashboardAppState>((set, get) => ({
  // Authentication
  user: null,
  setUser: (user: UserTable | null) => set({ user }),

  // Organizations
  organizations: [],
  setOrganizations: (organizations: OrganizationTable[]) => set({ organizations }),
  fetchOrganizations: async () => {
    const user = get().user;
    if (!user) throw new Error('No user selected');
    const organizations = await growlySuiteSdk.organizations.getOrganizationsByUserId(user.id);
    set({ organizations });
  },

  // Selected Organization
  selectedOrganization: null,
  setSelectedOrganization: (organization: OrganizationTable) =>
    set({ selectedOrganization: organization }),

  // Workflows
  workflows: [],
  getWorkflow: (workflowId: string) => get().workflows.find(workflow => workflow.id === workflowId),
  setWorkflows: (workflows: AggregatedWorkflow[]) => set({ workflows }),
  fetchWorkflows: async () => {
    const selectedOrganization = get().selectedOrganization;
    if (!selectedOrganization) throw new Error('No organization selected');

    const aggregatedWorkflows: AggregatedWorkflow[] =
      await growlySuiteSdk.workflows.getWorkflowsByOrganizationId(selectedOrganization.id);
    set({ workflows: aggregatedWorkflows });
  },

  // Steps
  fetchSteps: async (workflowId: string) => {
    const steps = await growlySuiteSdk.db.steps.getAllByField('workflow_id', workflowId);
    set(state => ({
      workflows: state.workflows.map(workflow =>
        workflow.id === workflowId ? { ...workflow, steps } : workflow
      ),
    }));
  },
}));
