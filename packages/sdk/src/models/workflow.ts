/**
 * A workflow ID. (e.g. `workflow-123`)
 */
export type WorkflowId = `workflow-${string}`;
/**
 * A step ID. (e.g. `step-123`)
 */
export type StepId = `step-${string}`;
/**
 * An agent ID. (e.g. `agent-123`)
 */
export type AgentId = `agent-${string}`;

export type UserDefinedPayload = UserDefinedStep;

/**
 * A user defined step.
 */
export type UserDefinedStep = {
  type: 'step';
  payload: {
    /** Step ID. (e.g. `step-123`) */
    id: StepId;
    /** Workflow ID. (e.g. `workflow-123`) */
    workflow: WorkflowId;
    /** Conditions for the step to be triggered. Conditions will be checked in order. */
    conditions?: Condition[];
  };
};

/**
 * A workflow is a collection of steps.
 */
export interface Workflow {
  /** Workflow ID. (e.g. `workflow-123`) */
  id: WorkflowId;
  /** Workflow name. */
  name: string;
  /** Workflow description. */
  description: string;
  /** Workflow steps. */
  steps: Step[];
  /** Workflow status. */
  status: Status;
  /** Workflow created at. */
  created_at: Date;
}

/**
 * A step is an action to be performed when a condition or multiple conditions is met.
 */
export interface Step {
  id: StepId;
  /** Step name. */
  name: string;
  /** Step description. */
  description: string;
  /** Conditions for the step to be triggered. Conditions will be checked in order. */
  conditions: Condition[];
  /** Action to be performed when the step is triggered. */
  action: Action[];
  /** Step status. */
  status: Status;
  /** Step created at. */
  created_at: Date;
}

export enum Status {
  /** The workflow is active. */
  Active = 'active',
  /** The workflow is inactive. */
  Inactive = 'inactive',
}

export type Condition = ScalarCondition | OrCondition | AndCondition;

/**
 * A single condition for a step to be triggered.
 *
 * The step will be triggered if defined conditions met.
 *
 * - `boolean`: The condition is true.
 * - `StepId`: The step with the given ID is completed.
 * - `WorkflowId`: The workflow with the given ID is completed.
 * - `UIEventCondition`: The event condition is met.
 */
export type ScalarCondition = boolean | StepId | WorkflowId | UIEventCondition;

/**
 * A condition is fulfilled if any of the conditions are true.
 */
export type OrCondition = {
  type: 'or';
  conditions: ScalarCondition[];
};

/**
 * A condition is fulfilled if all of the conditions are true.
 */
export type AndCondition = {
  type: 'and';
  conditions: ScalarCondition[];
};

/**
 * An event condition for a step to be triggered.
 */
export enum UIEventCondition {
  /** The condition is always true. */
  Always = 'always',
  /** The condition is true when the page is loaded. */
  OnPageLoad = 'onPageLoad',
  /** The condition is true when the element is visited. */
  OnVisited = 'onVisited',
  /** The condition is true when the element is clicked. */
  OnClicked = 'onClicked',
  /** The condition is true when the element is hovered. */
  OnHovered = 'onHovered',
}

/**
 * An action to be performed when a step is triggered.
 */
export type Action = TextAction | AgentAction;

/**
 * A text action is an action that returns a text.
 */
export interface TextAction {
  type: 'text';
  return: {
    text: string;
  };
}

/**
 * An agent action is an action that is performed by an agent.
 *
 * Returns another action.
 */
export interface AgentAction {
  type: 'agent';
  args: {
    agentId: AgentId;
    model: string;
    prompt: string;
  };
  return: Action;
}
