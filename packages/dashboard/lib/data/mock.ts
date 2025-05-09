import { Agent, AggregatedAgent, Organization, Status, Workflow } from '@growly/core';

// Mock data for organizations
export const organizations: Organization[] = [
  {
    id: '1',
    name: 'Acme Inc',
    description: 'A global leader in innovative solutions for enterprise businesses.',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Globex Corporation',
    description: 'Specializing in cutting-edge technology and software development.',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Initech',
    description: 'Providing business process automation and consulting services.',
    created_at: new Date().toISOString(),
  },
];

// Mock data for agents
export const agents: AggregatedAgent[] = [
  {
    id: 'agent-1',
    name: 'Customer Support Agent',
    model: 'gpt-4',
    description: 'Handles customer inquiries and support tickets',
    organization_id: '1',
    resources: ['knowledge-base-1', 'faq-database'],
    workflows: ['workflow-1', 'workflow-3'],
    status: Status.Active,
    created_at: new Date().toISOString(),
  },
  {
    id: 'agent-2',
    name: 'Sales Assistant',
    model: 'claude-3',
    description: 'Assists with sales inquiries and lead qualification',
    organization_id: '1',
    resources: ['product-catalog', 'pricing-sheet'],
    workflows: ['workflow-2'],
    status: Status.Active,
    created_at: new Date().toISOString(),
  },
  {
    id: 'agent-3',
    name: 'Data Analyst',
    model: 'gpt-4',
    description: 'Analyzes business data and generates reports',
    organization_id: '2',
    resources: ['analytics-db', 'reporting-tools'],
    workflows: ['workflow-4'],
    status: Status.Inactive,
    created_at: new Date().toISOString(),
  },
];

// Mock data for workflows
export const workflows: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'Ticket Resolution',
    description: 'Process for resolving customer support tickets',
    organization_id: '1',
    status: Status.Active,
    created_at: new Date().toISOString(),
  },
  {
    id: 'workflow-2',
    name: 'Lead Qualification',
    description: 'Process for qualifying sales leads',
    organization_id: '1',
    status: Status.Active,
    created_at: new Date().toISOString(),
  },
  {
    id: 'workflow-3',
    name: 'Customer Onboarding',
    description: 'Process for onboarding new customers',
    organization_id: '1',
    status: Status.Active,
    created_at: new Date().toISOString(),
  },
  {
    id: 'workflow-4',
    name: 'Monthly Reporting',
    description: 'Process for generating monthly business reports',
    organization_id: '2',
    status: Status.Active,
    created_at: new Date().toISOString(),
  },
  {
    id: 'workflow-5',
    name: 'Content Approval',
    description: 'Process for approving new content',
    organization_id: '3',
    status: Status.Active,
    created_at: new Date().toISOString(),
  },
];

// Helper function to get agents for a specific organization
export function getAgentsByOrganization(organizationId: string): AggregatedAgent[] {
  return agents.filter(agent => agent.organization_id === organizationId);
}

// Helper function to get a specific agent by ID
export function getAgentById(agentId: string): AggregatedAgent | undefined {
  return agents.find(agent => agent.id === agentId);
}

// Helper function to get workflows for a specific organization
export function getWorkflowsByOrganization(organizationId: string): Workflow[] {
  return workflows.filter(workflow => workflow.organization_id === organizationId);
}
