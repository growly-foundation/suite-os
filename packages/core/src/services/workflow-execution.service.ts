import { Condition, Action, ConditionType } from '@/models/steps';
import { WorkflowService } from './workflow.service';
import { SuiteDatabaseCore } from '@/core';

export class WorkflowExecutionService {
  constructor(
    private workflowService: WorkflowService,
    private suiteCore: SuiteDatabaseCore
  ) {}

  async evaluateCondition(condition: Condition): Promise<boolean> {
    switch (condition.type) {
      case ConditionType.Always:
        return condition.data;
      case ConditionType.Step:
        // TODO: Implement step condition evaluation
        const step = await this.suiteCore.db.steps.getOneByFields({ id: condition.data });
        if (!step) return false;
        return true;
      case ConditionType.Workflow:
        // TODO: Implement workflow condition evaluation
        const workflow = await this.suiteCore.db.workflows.getOneByFields({ id: condition.data });
        if (!workflow) return false;
        return true;
      case ConditionType.UIEvent:
        // TODO: Implement UI event condition evaluation
        return true;
      case ConditionType.JudgedByAgent:
        // TODO: Implement agent judgment condition evaluation
        const agent = await this.suiteCore.db.agents.getOneByFields({ id: condition.data.agentId });
        if (!agent) return false;
        return true;
      case ConditionType.Or:
        return condition.data.some(c => this.evaluateCondition(c));
      case ConditionType.And:
        return condition.data.every(c => this.evaluateCondition(c));
      default:
        return false;
    }
  }

  async executeAction(action: Action): Promise<any> {
    switch (action.type) {
      case 'text':
        // TODO: Implement text action execution
        return action.return.text;
      case 'agent':
        // TODO: Execute agent action
        const result = '';
        // Execute the return action
        return this.executeAction(action.return);
      default:
        return null;
    }
  }

  async executeWorkflowForAgent(agentId: string): Promise<void> {
    try {
      // Get all active workflows for the agent
      const agentWorkflows = await this.suiteCore.db.agent_workflows.getAllByFields({
        agent_id: agentId,
        status: 'active',
      });

      for (const agentWorkflow of agentWorkflows) {
        const workflow = await this.workflowService.getWorkflowWithSteps(agentWorkflow.workflow_id);
        if (!workflow) continue;

        // Execute each step in order
        for (const step of workflow.steps.sort((a, b) => a.index - b.index)) {
          // Check if conditions are met
          let conditionsMet = true;
          for (const condition of step.conditions) {
            if (!(await this.evaluateCondition(condition))) {
              conditionsMet = false;
              break;
            }
          }

          if (conditionsMet) {
            // Execute all actions in the step
            for (const action of step.action) {
              await this.executeAction(action);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }
}
