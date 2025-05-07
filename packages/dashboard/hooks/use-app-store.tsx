import { growlySdk } from '@/core/growly-services';
import { AggregatedWorkflow } from '@growly/sdk';
import { create } from 'zustand';
import { OrganizationTable, UserTable } from '@growly/sdk';

export type AppStore = {
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
  setWorkflows: (workflows: AggregatedWorkflow[]) => void;
  fetchWorkflows: () => Promise<void>;

  // Steps
  fetchSteps: (workflowId: string) => Promise<void>;
};

export const useAppStore = create<AppStore>((set, get) => ({
  // Authentication
  user: null,
  setUser: (user: UserTable | null) => set({ user }),

  // Organizations
  organizations: [],
  setOrganizations: (organizations: OrganizationTable[]) => set({ organizations }),
  fetchOrganizations: async () => {
    const user = get().user;
    if (!user) throw new Error('No user selected');
    const organizations = await growlySdk.organization.getOrganizationsByUserId(user.id);
    set({ organizations });
  },

  // Selected Organization
  selectedOrganization: null,
  setSelectedOrganization: (organization: OrganizationTable) =>
    set({ selectedOrganization: organization }),

  // Workflows
  workflows: [],
  setWorkflows: (workflows: AggregatedWorkflow[]) => set({ workflows }),
  fetchWorkflows: async () => {
    const selectedOrganization = get().selectedOrganization;
    if (!selectedOrganization) throw new Error('No organization selected');

    const aggregatedWorkflows: AggregatedWorkflow[] =
      await growlySdk.workflow.getWorkflowsByOrganizationId(selectedOrganization.id);
    set({ workflows: aggregatedWorkflows });
  },

  // Steps
  fetchSteps: async (workflowId: string) => {
    const steps = await growlySdk.db.step.getAllById('workflow_id', workflowId);
    set(state => ({
      workflows: state.workflows.map(workflow =>
        workflow.id === workflowId ? { ...workflow, steps } : workflow
      ),
    }));
  },
}));
