import { Tables } from '@/types/database.types';
import { AgentId, OrganizationId, StepId, WorkflowId } from './ids';

export type Step = Tables<'steps'>;

/**
 * A step is an action to be performed when a condition or multiple conditions is met.
 */
export type ParsedStep = Omit<Step, 'conditions' | 'action'> & {
  /** Conditions for the step to be triggered. Conditions will be checked in order. */
  conditions: Condition;
  /** Action to be performed when the step is triggered. */
  action: Action[];
};

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
export type ScalarCondition =
  | boolean
  | StepId
  | WorkflowId
  | UIEventCondition
  | JudgedByAgentCondition;

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
 * A condition is fulfilled if the agent judges the step as true.
 * The agent will be asked to judge the step.
 */
export interface JudgedByAgentCondition {
  type: 'judgedByAgent';
  args: {
    /** The step ID to be judged. */
    stepId: StepId;
    /** The agent ID to judge the step. */
    agentId: AgentId;
    /** The prompt to be sent to the agent. */
    prompt: string;
  };
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
    organizationId: OrganizationId;
    /** Example: "gpt-4o" */
    model: string;
    /** Example: "Analyze the following portfolio?" */
    prompt: string;
  };
  return: Action;
}
