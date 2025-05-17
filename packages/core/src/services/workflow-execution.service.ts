import { Condition, Action, ConditionType, ParsedStep } from '@/models/steps';
import { UIEventCondition } from '@/models/steps';
import { StepId, WorkflowId } from '@/models/ids';
import { AggregatedWorkflow, Status } from '@/models';

type DependencyMap = {
  uiEvent: Map<UIEventCondition, ParsedStep[]>;
  stepCompleted: Map<StepId, ParsedStep[]>;
  workflowCompleted: Map<WorkflowId, ParsedStep[]>;
  judgedByAgent: Map<StepId, ParsedStep[]>;
  always: ParsedStep[];
};

/**
 * Handles the execution of workflows.
 */
export class WorkflowExecutionService {
  private dependencyMap: DependencyMap;
  private completedSteps = new Set<StepId>();
  private completedWorkflows = new Set<WorkflowId>();
  private agentJudgments = new Map<StepId, boolean>();
  private executeActions: (actions: Action[]) => void;

  constructor(workflows: AggregatedWorkflow[], executeActions: (actions: Action[]) => void) {
    this.executeActions = executeActions;
    this.dependencyMap = this.buildDependencyMap(workflows);
    this.triggerAlwaysSteps();
  }

  triggerUIEvent(event: UIEventCondition, stepId?: StepId, conditions?: Condition[]) {
    const steps = this.dependencyMap.uiEvent.get(event) || [];
    if (conditions) {
      if (!this.evaluateConditions(conditions)) return;
    }
    if (stepId) {
      const step = steps.find(s => s.id === stepId);
      if (!step) return;
      this.evaluateAndExecuteStep(step);
    } else {
      this.evaluateAndExecuteSteps(steps);
    }
  }

  handleAgentJudgment(stepId: StepId, accepted: boolean) {
    this.agentJudgments.set(stepId, accepted);
    const steps = this.dependencyMap.judgedByAgent.get(stepId) || [];
    this.evaluateAndExecuteSteps(steps);
  }

  private markStepCompleted(stepId: StepId) {
    this.completedSteps.add(stepId);
    const steps = this.dependencyMap.stepCompleted.get(stepId) || [];
    this.evaluateAndExecuteSteps(steps);
  }

  private markWorkflowCompleted(workflowId: WorkflowId) {
    this.completedWorkflows.add(workflowId);
    const steps = this.dependencyMap.workflowCompleted.get(workflowId) || [];
    this.evaluateAndExecuteSteps(steps);
  }

  private evaluateAndExecuteSteps(steps: ParsedStep[]) {
    for (const step of steps) {
      this.evaluateAndExecuteStep(step);
    }
  }

  private evaluateAndExecuteStep(step: ParsedStep) {
    if (this.evaluateConditions(step.conditions)) {
      this.executeActions(step.action);
      this.markStepCompleted(step.id);
    }
  }

  private evaluateConditions(conditions: Condition[]): boolean {
    return conditions.every(cond => this.evaluateCondition(cond));
  }

  private evaluateCondition(cond: Condition): boolean {
    switch (cond.type) {
      case ConditionType.Always:
        return true;
      case ConditionType.Step:
        return this.completedSteps.has(cond.data);
      case ConditionType.Workflow:
        return this.completedWorkflows.has(cond.data);
      case ConditionType.JudgedByAgent:
        return this.agentJudgments.get(cond.data.stepId) === true;
      case ConditionType.And:
        return cond.data.every((sub: Condition) => this.evaluateCondition(sub));
      case ConditionType.Or:
        return cond.data.some((sub: Condition) => this.evaluateCondition(sub));
      case ConditionType.UIEvent:
        return false; // UIEvent should trigger via triggerUIEvent
      default:
        return false;
    }
  }

  private buildDependencyMap(workflows: AggregatedWorkflow[]): DependencyMap {
    const map: DependencyMap = {
      uiEvent: new Map(),
      stepCompleted: new Map(),
      workflowCompleted: new Map(),
      judgedByAgent: new Map(),
      always: [],
    };
    for (const wf of workflows) {
      if (wf.status === Status.Inactive) continue;
      for (const step of wf.steps) {
        for (const cond of step.conditions) {
          this.collectStepDependencies(cond, step, map);
        }
      }
    }
    return map;
  }

  private collectStepDependencies(cond: Condition, step: ParsedStep, map: DependencyMap): void {
    switch (cond.type) {
      case ConditionType.Always:
        map.always.push(step);
        break;
      case ConditionType.UIEvent:
        this.addToMap(map.uiEvent, cond.data, step);
        break;
      case ConditionType.Step:
        this.addToMap(map.stepCompleted, cond.data, step);
        break;
      case ConditionType.Workflow:
        this.addToMap(map.workflowCompleted, cond.data, step);
        break;
      case ConditionType.JudgedByAgent:
        this.addToMap(map.judgedByAgent, cond.data.stepId, step);
        break;
      case ConditionType.And:
      case ConditionType.Or:
        for (const sub of cond.data) {
          this.collectStepDependencies(sub, step, map);
        }
        break;
    }
  }

  private addToMap<K>(map: Map<K, ParsedStep[]>, key: K, step: ParsedStep) {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(step);
  }

  private triggerAlwaysSteps() {
    const steps = this.dependencyMap.always;
    this.evaluateAndExecuteSteps(steps);
  }
}
