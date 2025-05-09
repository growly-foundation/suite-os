import { AggregatedAgent, AggregatedWorkflow, Organization, Status, Workflow } from '@growly/core';

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

export const mockWorkflows: AggregatedWorkflow[] = [
  {
    id: 'workflow-1',
    name: 'Customer Support Workflow',
    description: 'Automated workflow for handling customer support tickets',
    organization_id: 'org-1',
    status: 'active',
    created_at: '2023-05-15T10:30:00Z',
    steps: [
      {
        id: 'step-1',
        name: 'Ticket Classification',
        description: 'Classify the support ticket by category',
        index: 0,
        status: 'active',
        workflow_id: 'workflow-1',
        created_at: '2023-05-15T10:35:00Z',
        conditions: true,
        action: [
          {
            type: 'agent',
            args: {
              agentId: 'agent-1',
              organizationId: 'org-1',
              model: 'gpt-4o',
              prompt:
                'Classify this support ticket into one of the following categories: Billing, Technical, Account, Other',
            },
            return: {
              type: 'text',
              return: {
                text: '',
              },
            },
          },
        ],
      },
      {
        id: 'step-2',
        name: 'Priority Assignment',
        description: 'Assign priority level to the ticket',
        index: 1,
        status: 'active',
        workflow_id: 'workflow-1',
        created_at: '2023-05-15T10:40:00Z',
        conditions: {
          type: 'and',
          conditions: ['step-1'],
        },
        action: [
          {
            type: 'agent',
            args: {
              agentId: 'agent-2',
              organizationId: 'org-1',
              model: 'gpt-4o',
              prompt:
                'Assign a priority level (Low, Medium, High, Critical) to this support ticket',
            },
            return: {
              type: 'text',
              return: {
                text: '',
              },
            },
          },
        ],
      },
      {
        id: 'step-3',
        name: 'Response Generation',
        description: 'Generate an initial response to the customer',
        index: 2,
        status: 'active',
        workflow_id: 'workflow-1',
        created_at: '2023-05-15T10:45:00Z',
        conditions: {
          type: 'and',
          conditions: ['step-2'],
        },
        action: [
          {
            type: 'agent',
            args: {
              agentId: 'agent-3',
              organizationId: 'org-1',
              model: 'gpt-4o',
              prompt:
                'Generate an initial response to the customer based on the ticket category and priority',
            },
            return: {
              type: 'text',
              return: {
                text: '',
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'workflow-2',
    name: 'Content Approval Process',
    description: 'Workflow for reviewing and approving content before publication',
    organization_id: 'org-1',
    status: 'active',
    created_at: '2023-06-10T14:20:00Z',
    steps: [
      {
        id: 'step-4',
        name: 'Content Review',
        description: 'Review content for quality and accuracy',
        index: 0,
        status: 'active',
        workflow_id: 'workflow-2',
        created_at: '2023-06-10T14:25:00Z',
        conditions: true,
        action: [
          {
            type: 'agent',
            args: {
              agentId: 'agent-4',
              organizationId: 'org-1',
              model: 'gpt-4o',
              prompt: 'Review this content for quality, accuracy, and adherence to guidelines',
            },
            return: {
              type: 'text',
              return: {
                text: '',
              },
            },
          },
        ],
      },
      {
        id: 'step-5',
        name: 'SEO Optimization',
        description: 'Optimize content for search engines',
        index: 1,
        status: 'active',
        workflow_id: 'workflow-2',
        created_at: '2023-06-10T14:30:00Z',
        conditions: {
          type: 'and',
          conditions: ['step-4'],
        },
        action: [
          {
            type: 'agent',
            args: {
              agentId: 'agent-5',
              organizationId: 'org-1',
              model: 'gpt-4o',
              prompt: 'Suggest SEO improvements for this content',
            },
            return: {
              type: 'text',
              return: {
                text: '',
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'workflow-3',
    name: 'Lead Qualification',
    description: 'Qualify sales leads based on criteria',
    organization_id: 'org-1',
    status: 'inactive',
    created_at: '2023-07-05T09:15:00Z',
    steps: [],
  },
];
