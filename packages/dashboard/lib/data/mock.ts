import { ParsedStep, ConditionType, UIEventCondition, Status } from '@growly/core';
import { generateId } from '../utils';

const stepId1 = 'step-1';
const stepId2 = 'step-2';
const stepId3 = 'step-3';
const stepId4 = 'step-4';

export const mockSteps: ParsedStep[] = [
  // Independent root step - always trigger
  {
    id: stepId1,
    name: 'Welcome to DeFi Portal',
    conditions: [
      {
        id: generateId(),
        type: ConditionType.Always,
        data: true,
      },
    ],
    action: [
      {
        id: generateId(),
        type: 'text',
        return: { text: 'Welcome to DeFi Swap! Let’s get you started.' },
      },
    ],
    workflow_id: 'workflow-1',
    created_at: new Date().toISOString(),
    description: 'Initial greeting for users entering the decentralized swap interface.',
    index: 0,
    status: Status.Active,
  },

  // Dependent step - triggered when step-1 is done
  {
    id: stepId2,
    name: 'Connect Wallet Prompt',
    conditions: [
      {
        id: generateId(),
        type: ConditionType.Step,
        data: stepId1,
      },
    ],
    action: [
      {
        id: generateId(),
        type: 'text',
        return: { text: 'Please connect your wallet to start trading.' },
      },
    ],
    workflow_id: 'workflow-1',
    created_at: new Date().toISOString(),
    description: 'Prompt the user to connect their wallet after the welcome message.',
    index: 1,
    status: Status.Active,
  },

  // Step triggered by UI event AND previous step
  {
    id: stepId3,
    name: 'Offer Yield Opportunity',
    conditions: [
      {
        id: generateId(),
        type: ConditionType.And,
        data: [
          {
            id: generateId(),
            type: ConditionType.Step,
            data: stepId2,
          },
          {
            id: generateId(),
            type: ConditionType.UIEvent,
            data: UIEventCondition.OnClicked,
          },
        ],
      },
    ],
    action: [
      {
        id: generateId(),
        type: 'text',
        return: { text: 'Discover high-yield farming pools now available!' },
      },
    ],
    workflow_id: 'workflow-1',
    created_at: new Date().toISOString(),
    description:
      'Once the wallet is connected and the user clicks on “Explore Pools,” show them yield opportunities.',
    index: 2,
    status: Status.Active,
  },

  // Branching step with OR condition on step-2 or judged by agent
  {
    id: stepId4,
    name: 'Request Feedback on Swap Experience',
    conditions: [
      {
        id: generateId(),
        type: ConditionType.Or,
        data: [
          {
            id: generateId(),
            type: ConditionType.Step,
            data: stepId2,
          },
          {
            id: generateId(),
            type: ConditionType.JudgedByAgent,
            data: {
              stepId: stepId4,
              agentId: 'agent-1',
              prompt: 'Should we ask the user for feedback now?',
            },
          },
        ],
      },
    ],
    action: [
      {
        id: generateId(),
        type: 'agent',
        args: {
          prompt: 'Collect feedback on the swap process and user interface.',
          agentId: 'agent-1',
          organizationId: 'org-1',
          stepId: stepId4,
        },
        return: {
          id: generateId(),
          type: 'text',
          return: { text: 'Thank you for helping us improve!' },
        },
      },
    ],
    workflow_id: 'workflow-1',
    created_at: new Date().toISOString(),
    description:
      'Gather user feedback either after they connect their wallet or when prompted by a support agent.',
    index: 3,
    status: Status.Active,
  },
];
