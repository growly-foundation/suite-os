import { suiteCore } from '@/core/suite';
import { AggregatedOrganization, AggregatedWorkflow, WorkflowId } from '@growly/core';
import { create } from 'zustand';
import { Admin } from '@growly/core';

export const STORAGE_KEY_SELECTED_ORGANIZATION_ID = (userId: string) =>
  `SUITE_SELECTED_ORGANIZATION_ID_${userId}`;

/**
 * State storage for managing application state.
 */
export type DashboardAppState = {
  // Authentication
  admin: Admin | null;
  setAdmin: (user: Admin | null) => void;

  // Selected Organization
  selectedOrganization: AggregatedOrganization | null;
  setSelectedOrganization: (organization: AggregatedOrganization) => void;

  // Organizations
  fetchOrganizations: () => Promise<AggregatedOrganization[]>;
  organizations: AggregatedOrganization[];
  setOrganizations: (organizations: AggregatedOrganization[]) => void;
  createOrganization: (name: string, description: string) => Promise<AggregatedOrganization>;

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

  // Selected Organization
  selectedOrganization: null,
  setSelectedOrganization: (organization: AggregatedOrganization) => {
    const admin = get().admin;
    if (!admin?.id) throw new Error('No admin authenticated');
    localStorage.setItem(STORAGE_KEY_SELECTED_ORGANIZATION_ID(admin.id), organization.id);
    set({ selectedOrganization: organization });
  },

  // Organizations
  organizations: [],
  setOrganizations: (organizations: AggregatedOrganization[]) => set({ organizations }),
  fetchOrganizations: async () => {
    const admin = get().admin;
    if (!admin) throw new Error('No admin authenticated');
    const organizations = await suiteCore.organizations.getOrganizationsByAdminId(admin.id);
    set({ organizations });
    return organizations;
  },
  createOrganization: async (name: string, description: string) => {
    const admin = get().admin;
    if (!admin) throw new Error('No admin authenticated');
    const organization = await suiteCore.organizations.createOrganization(
      name,
      description,
      admin.id
    );
    set({ organizations: [...get().organizations, organization] });
    return organization;
  },

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
    if (!workflow) throw new Error('Workflow not found');
    set(state => ({
      workflows: state.workflows.map(w => (workflow.id === workflowId ? workflow : w)),
    }));
  },
}));
