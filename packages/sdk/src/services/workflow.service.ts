import { AggregatedWorkflow } from '@/models/workflows';
import { Condition, Action } from '@/models/steps';
import { PublicDatabaseService } from './database.service';

export class WorkflowService {
  constructor(
    private workflowDatabaseService: PublicDatabaseService<'workflows'>,
    private stepDatabaseService: PublicDatabaseService<'steps'>
  ) {}

  async getWorkflowsByOrganizationId(organizationId: string): Promise<AggregatedWorkflow[]> {
    const workflows = await this.workflowDatabaseService.getAllByField(
      'organization_id',
      organizationId
    );
    const aggregatedWorkflows: AggregatedWorkflow[] = [];
    for (const workflow of workflows) {
      const steps = await this.stepDatabaseService.getAllByField('workflow_id', workflow.id);
      aggregatedWorkflows.push({
        ...workflow,
        steps: steps.map(step => ({
          ...step,
          // Expect an array of conditions and actions.
          conditions: step.conditions as any as Condition[],
          action: step.action as any as Action[],
        })),
      });
    }
    return aggregatedWorkflows;
  }
}
