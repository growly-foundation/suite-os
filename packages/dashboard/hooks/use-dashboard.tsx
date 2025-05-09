import { suiteCore } from '@/core/suite';
import { AggregatedOrganization, AggregatedWorkflow, Workflow, WorkflowId } from '@growly/core';
import { create } from 'zustand';
import { Organization, Admin } from '@growly/core';

/**
 * State storage for managing application state.
 */
export type DashboardAppState = {
  // Authentication
  admin: Admin | null;
  setAdmin: (user: Admin | null) => void;

  // Organizations
  fetchOrganizations: () => Promise<void>;
  organizations: Organization[];
  setOrganizations: (organizations: Organization[]) => void;

  // Selected Organization
  selectedOrganization: AggregatedOrganization | null;
  setSelectedOrganization: (organization: AggregatedOrganization) => void;

  // Workflows
  workflows: AggregatedWorkflow[];
  getWorkflow: (workflowId: WorkflowId) => AggregatedWorkflow | undefined;
  setWorkflows: (workflows: AggregatedWorkflow[]) => void;
  fetchWorkflows: () => Promise<void>;
  fetchWorkflowById: (workflowId: WorkflowId) => Promise<void>;
};

/**
 * Hook for managing application state.
 */
export const useDashboardState = create<DashboardAppState>((set, get) => ({
  // Authentication
  admin: null,
  setAdmin: (admin: Admin | null) => set({ admin }),

  // Organizations
  organizations: [],
  setOrganizations: (organizations: Organization[]) => set({ organizations }),
  fetchOrganizations: async () => {
    const user = get().admin;
    if (!user) throw new Error('No user selected');
    const organizations = await suiteCore.organizations.getOrganizationsByAdminId(user.id);
    set({ organizations });
  },

  // Selected Organization
  selectedOrganization: null,
  setSelectedOrganization: (organization: AggregatedOrganization) =>
    set({ selectedOrganization: organization }),

  // Workflows
  workflows: [],
  getWorkflow: (workflowId: string) => get().workflows.find(workflow => workflow.id === workflowId),
  setWorkflows: (workflows: AggregatedWorkflow[]) => set({ workflows }),
  fetchWorkflows: async () => {
    const selectedOrganization = get().selectedOrganization;
    if (!selectedOrganization) throw new Error('No organization selected');

    const aggregatedWorkflows: AggregatedWorkflow[] =
      await suiteCore.workflows.getWorkflowsByOrganizationId(selectedOrganization.id);
    set({ workflows: aggregatedWorkflows });
  },

  // Steps
  fetchWorkflowById: async (workflowId: string) => {
    const workflow = await suiteCore.workflows.getWorkflowWithSteps(workflowId);
    set(state => ({
      workflows: state.workflows.map(w => (workflow.id === workflowId ? workflow : w)),
    }));
  },
}));
