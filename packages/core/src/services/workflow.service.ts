import { AggregatedWorkflow } from '@/models/workflows';
import { Condition, Action } from '@/models/steps';
import { PublicDatabaseService } from './database.service';
import { OrganizationId, WorkflowId } from '@/models';

export class WorkflowService {
  constructor(
    private workflowDatabaseService: PublicDatabaseService<'workflows'>,
    private stepDatabaseService: PublicDatabaseService<'steps'>
  ) {}

  async getWorkflowWithSteps(workflowId: WorkflowId) {
    try {
      const workflow = await this.workflowDatabaseService.getOneByFields({ id: workflowId });
      if (!workflow) throw new Error('Workflow not found');
      const steps = await this.stepDatabaseService.getAllByFields({
        workflow_id: workflow.id,
      });
      return {
        ...workflow,
        steps: steps.map(step => ({
          ...step,
          // Expect an array of conditions and actions.
          conditions: step.conditions as any as Condition,
          action: step.action as any as Action[],
        })),
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getWorkflowsByOrganizationId(
    organization_id: OrganizationId
  ): Promise<AggregatedWorkflow[]> {
    const workflows = await this.workflowDatabaseService.getAllByFields({
      organization_id,
    });
    const aggregatedWorkflows: AggregatedWorkflow[] = [];
    for (const workflow of workflows) {
      const steps = await this.stepDatabaseService.getAllByFields({
        workflow_id: workflow.id,
      });
      aggregatedWorkflows.push({
        ...workflow,
        steps: steps.map(step => ({
          ...step,
          // Expect an array of conditions and actions.
          conditions: step.conditions as any as Condition,
          action: step.action as any as Action[],
        })),
      });
    }
    return aggregatedWorkflows;
  }
}
