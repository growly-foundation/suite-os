import { AgentId, OrganizationId, WorkflowId } from './ids';
import { Status } from './workflows';

/**
 * An agent is an AI agent that can perform actions.
 */
export interface Agent {
  /** Agent ID. */
  id: AgentId;
  /** Agent name. */
  name: string;
  /** Agent model. */
  model: string;
  /** Agent description. */
  description?: string;
  /** Organization ID. */
  organization: OrganizationId;
  /** Agent resources. */
  resources: string[];
  /** Agent workflows. */
  workflows: WorkflowId[];
  /** Agent status. */
  status: Status;
  /** Agent created at. */
  created_at: Date;
}
