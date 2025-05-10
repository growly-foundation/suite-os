import { PublicDatabaseService } from './database.service';
import { WorkflowService } from './workflow.service';
import { AggregatedAgent, AggregatedWorkflow, Status } from '@/models';

export class AgentService {
  constructor(
    private agentDatabaseService: PublicDatabaseService<'agents'>,
    private agentWorkflowsDatabaseService: PublicDatabaseService<'agent_workflows'>,
    private workflowService: WorkflowService
  ) {}

  async createOrUpdate(
    organization_id: string,
    agent: AggregatedAgent,
    isNewAgent: boolean
  ): Promise<void> {
    const payload = {
      description: agent.description,
      name: agent.name,
      model: agent.model,
      organization_id,
      resources: agent.resources,
      status: agent.status,
    };
    if (isNewAgent) {
      await this.agentDatabaseService.create(payload);
    } else {
      await this.agentDatabaseService.update(agent.id, payload);
    }
    for (const workflow of agent.workflows) {
      const existingAssociation = await this.agentWorkflowsDatabaseService.getOneByFields({
        agent_id: agent.id,
        workflow_id: workflow.id,
      });
      if (!existingAssociation) {
        await this.agentWorkflowsDatabaseService.create({
          agent_id: agent.id,
          workflow_id: workflow.id,
          status: Status.Active,
        });
      }
    }
  }

  async getAggregatedAgentsByOrganizationId(organization_id: string): Promise<AggregatedAgent[]> {
    const agents = await this.agentDatabaseService.getAllByFields({
      organization_id,
    });
    const aggregatedAgents: AggregatedAgent[] = [];
    for (const agent of agents) {
      const agentWithWorkflows = await this.getAggregatedAgent(agent.id);
      if (!agentWithWorkflows) continue;
      aggregatedAgents.push(agentWithWorkflows);
    }
    return aggregatedAgents;
  }

  async getAggregatedAgent(agent_id: string): Promise<AggregatedAgent | null> {
    const agent = await this.agentDatabaseService.getById(agent_id);
    if (!agent) return null;
    const agentWorkflows = await this.agentWorkflowsDatabaseService.getAllByFields({
      agent_id,
    });

    const workflows: AggregatedWorkflow[] = [];
    for (const { workflow_id } of agentWorkflows) {
      const workflow = await this.workflowService.getWorkflowWithSteps(workflow_id);
      if (!workflow) {
        continue;
      }
      workflows.push(workflow);
    }

    return {
      ...agent,
      workflows,
    };
  }
}
