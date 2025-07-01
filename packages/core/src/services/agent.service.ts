import { Agent, AggregatedAgent, AggregatedWorkflow, ParsedResource, Status } from '@/models';
import { TablesInsert } from '@/types/database.types';

import { PublicDatabaseService } from './database.service';
import { WorkflowService } from './workflow.service';

export class AgentService {
  constructor(
    private workflowService: WorkflowService,
    private agentDatabaseService: PublicDatabaseService<'agents'>,
    private agentWorkflowsDatabaseService: PublicDatabaseService<'agent_workflows'>,
    private agentResourcesDatabaseService: PublicDatabaseService<'agent_resources'>,
    private resourceDatabaseService: PublicDatabaseService<'resources'>
  ) {}

  async createOrUpdate(
    organization_id: string,
    agent: AggregatedAgent,
    isNewAgent: boolean
  ): Promise<AggregatedAgent> {
    const payload: TablesInsert<'agents'> = {
      description: agent.description,
      name: agent.name,
      model: agent.model,
      organization_id,
      status: agent.status,
    };
    const updatedAgent = isNewAgent
      ? await this.agentDatabaseService.create(payload)
      : await this.agentDatabaseService.update(agent.id, payload);

    // Update associations and track visited workflows.
    const visited: Record<string, boolean> = {};
    for (const workflow of agent.workflows) {
      try {
        await this.agentWorkflowsDatabaseService.create({
          agent_id: updatedAgent.id,
          workflow_id: workflow.id,
          status: Status.Active,
        });
        visited[workflow.id] = true;
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    // Remove associations that are no longer in the list
    const existingWorkflows = await this.agentWorkflowsDatabaseService.getAllByFields({
      agent_id: updatedAgent.id,
    });
    for (const workflow of existingWorkflows) {
      if (visited[workflow.workflow_id]) continue;
      await this.agentWorkflowsDatabaseService.deleteByFields({
        agent_id: updatedAgent.id,
        workflow_id: workflow.workflow_id,
      });
    }
    return {
      ...updatedAgent,
      workflows: agent.workflows,
      resources: agent.resources,
    };
  }

  async getAgentsByOrganizationId(organization_id: string): Promise<Agent[]> {
    return this.agentDatabaseService.getAllByFields(
      {
        organization_id,
      },
      undefined,
      {
        field: 'created_at',
        ascending: false,
      }
    );
  }

  async getAggregatedAgent(agent_id: string): Promise<AggregatedAgent | null> {
    const agent = await this.agentDatabaseService.getById(agent_id);
    if (!agent) return null;

    // Get workflows
    const agentWorkflows = await this.agentWorkflowsDatabaseService.getAllByFields(
      {
        agent_id,
      },
      undefined,
      {
        field: 'created_at',
        ascending: false,
      }
    );
    const workflows: AggregatedWorkflow[] = [];
    for (const { workflow_id } of agentWorkflows) {
      const workflow = await this.workflowService.getWorkflowWithSteps(workflow_id);
      if (!workflow) {
        continue;
      }
      workflows.push(workflow);
    }

    // Get resources
    const agentResources = await this.agentResourcesDatabaseService.getAllByFields(
      {
        agent_id,
      },
      undefined,
      {
        field: 'created_at',
        ascending: false,
      }
    );
    const resources: ParsedResource[] = [];
    for (const { resource_id } of agentResources) {
      const resource = await this.resourceDatabaseService.getById(resource_id);
      if (!resource) {
        continue;
      }
      resources.push(resource as ParsedResource);
    }
    return {
      ...agent,
      workflows,
      resources,
    };
  }
}
