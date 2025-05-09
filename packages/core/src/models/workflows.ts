import { StepId, WorkflowId } from './ids';
import { Tables } from '@/types/database.types';
import { Condition, ParsedStep } from './steps';

export type Workflow = Tables<'workflows'>;
export type AggregatedWorkflow = Workflow & { steps: ParsedStep[] };

export type UserDefinedPayload = UserDefinedStep;

/**
 * A user defined step.
 */
export type UserDefinedStep = {
  type: 'step';
  payload: {
    /** Step ID. */
    id: StepId;
    /** Workflow ID. */
    workflow: WorkflowId;
    /** Conditions for the step to be triggered. Conditions will be checked in order. */
    conditions?: Condition[];
  };
};

export enum Status {
  /** The workflow is active. */
  Active = 'active',
  /** The workflow is inactive. */
  Inactive = 'inactive',
}
