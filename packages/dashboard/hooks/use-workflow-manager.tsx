import { growlySdk } from '@/core/growly-services';
import { AggregatedWorkflow } from '@growly/sdk';
import { create } from 'zustand';

export type WorkflowManagerStore = {
  workflows: AggregatedWorkflow[];
  fetchWorkflows: () => Promise<void>;
  fetchSteps: (workflowId: string) => Promise<void>;
};

export const useWorkflowManagerStore = create<WorkflowManagerStore>((set, get) => ({
  workflows: [],
  fetchWorkflows: async () => {
    const aggregatedWorkflows: AggregatedWorkflow[] = await growlySdk
      .workflow()
      .getAggregatedWorkflows();
    set({ workflows: aggregatedWorkflows });
  },
  fetchSteps: async (workflowId: string) => {
    const steps = await growlySdk.db().step.getAll(workflowId);
    set(state => ({
      workflows: state.workflows.map(workflow =>
        workflow.id === workflowId ? { ...workflow, steps } : workflow
      ),
    }));
  },
}));
