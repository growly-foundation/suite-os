import { AggregatedWorkflow } from '@/types/workflow.types';
import { PublicDatabaseService } from './database.service';

export class WorkflowService {
  constructor(
    private workflowDatabaseService: PublicDatabaseService<'workflows'>,
    private stepDatabaseService: PublicDatabaseService<'steps'>
  ) {}

  async getWorkflowsByOrganizationId(organizationId: string): Promise<AggregatedWorkflow[]> {
    const workflows = await this.workflowDatabaseService.getAllById(
      'organization_id',
      organizationId
    );
    const aggregatedWorkflows: AggregatedWorkflow[] = [];
    for (const workflow of workflows) {
      const steps = await this.stepDatabaseService.getAllById('workflow_id', workflow.id);
      aggregatedWorkflows.push({ ...workflow, steps });
    }
    return aggregatedWorkflows;
  }
}
