import { AggregatedWorkflow } from '@/types/workflow.types';
import { StepDatabaseService } from './step-database.service';
import { WorkflowDatabaseService } from './workflow-database.service';

export class WorkflowService {
  constructor(
    private workflowDatabaseService: WorkflowDatabaseService,
    private stepDatabaseService: StepDatabaseService
  ) {}

  async getAggregatedWorkflows(): Promise<AggregatedWorkflow[]> {
    const workflows = await this.workflowDatabaseService.getAll();
    const aggregatedWorkflows: AggregatedWorkflow[] = [];
    for (const workflow of workflows) {
      const steps = await this.stepDatabaseService.getAll(workflow.id);
      aggregatedWorkflows.push({ ...workflow, steps });
    }
    return aggregatedWorkflows;
  }
}
