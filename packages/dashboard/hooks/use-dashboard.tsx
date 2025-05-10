import { suiteCore } from '@/core/suite';
import {
  AggregatedAgent,
  AggregatedOrganization,
  AggregatedWorkflow,
  WorkflowId,
} from '@growly/core';
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
  organizationWorkflows: AggregatedWorkflow[];
  getOrganizationWorkflows: (workflowId: WorkflowId) => AggregatedWorkflow | undefined;
  setOrganizationWorkflows: (workflows: AggregatedWorkflow[]) => void;
  fetchOrganizationWorkflows: () => Promise<AggregatedWorkflow[]>;
  fetchOrganizationWorkflowById: (workflowId: WorkflowId) => Promise<AggregatedWorkflow | null>;

  // Agents
  organizationAgents: AggregatedAgent[];
  fetchOrganizationAgents: () => Promise<AggregatedAgent[]>;
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

  // Agents
  organizationAgents: [],
  fetchOrganizationAgents: async () => {
    const selectedOrganization = get().selectedOrganization;
    if (!selectedOrganization) throw new Error('No organization selected');
    const agents = await suiteCore.agents.getAggregatedAgentsByOrganizationId(
      selectedOrganization.id
    );
    set({
      organizationAgents: agents,
    });
    return agents;
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
  organizationWorkflows: [],
  getOrganizationWorkflows: (workflowId: string) =>
    get().organizationWorkflows.find(workflow => workflow.id === workflowId),
  setOrganizationWorkflows: (workflows: AggregatedWorkflow[]) =>
    set({ organizationWorkflows: workflows }),
  fetchOrganizationWorkflows: async () => {
    const selectedOrganization = get().selectedOrganization;
    if (!selectedOrganization) throw new Error('No organization selected');

    const aggregatedWorkflows: AggregatedWorkflow[] =
      await suiteCore.workflows.getWorkflowsByOrganizationId(selectedOrganization.id);
    set({ organizationWorkflows: aggregatedWorkflows });
    return aggregatedWorkflows;
  },

  // Steps
  fetchOrganizationWorkflowById: async (workflowId: string) => {
    const workflow = await suiteCore.workflows.getWorkflowWithSteps(workflowId);
    if (!workflow) throw new Error('Workflow not found');
    set(state => ({
      organizationWorkflows: state.organizationWorkflows.map(w =>
        workflow.id === workflowId ? workflow : w
      ),
    }));
    return workflow;
  },
}));
