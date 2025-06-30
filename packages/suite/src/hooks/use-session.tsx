import { suiteCoreService } from '@/services/core.service';
import { userService } from '@/services/user.service';
import { Screen } from '@/types/screen';
import { create } from 'zustand';

import {
  Agent,
  AgentId,
  AggregatedWorkflow,
  Message,
  MessageContent,
  ParsedMessage,
  ParsedStep,
  ParsedUser,
  WorkflowExecutionService,
} from '@getgrowly/core';
import { BusterState } from '@getgrowly/ui';

type Optional<T> = T | undefined | null;

interface WidgetSession {
  busterState: BusterState;
  workflowExecutionService: WorkflowExecutionService | null;
  initWorkflowExecutionService: (
    workflows: AggregatedWorkflow[],
    executeStep: (step: ParsedStep) => void
  ) => WorkflowExecutionService;
  setBusterState: (state: BusterState) => void;
  panelOpen: boolean;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  screen: Screen;
  setScreen: (screen: Screen) => void;
  user: Optional<ParsedUser>;
  inputValue: string;
  setInputValue: (value: string) => void;
  agent: Optional<Agent>;
  messages: ParsedMessage[];
  isLoadingMessages: boolean;
  isAgentThinking: boolean;
  setIsAgentThinking: (isThinking: boolean) => void;
  setUser: (user: Optional<ParsedUser>) => void;
  setAgent: (agent: Optional<Agent>) => void;
  setMessages: (messages: ParsedMessage[]) => void;
  addMessage: (message: ParsedMessage) => void;
  fetchMessages: () => Promise<ParsedMessage[]>;
  createUserFromAddressIfNotExist: (walletAddress: `0x${string}`) => Promise<Optional<ParsedUser>>;
  fetchOrganizationAgentById: (agentId: AgentId, apiKey: string) => Promise<Optional<Agent>>;
}

/**
 * Access to the current session data of the widget. For example, current user, agent, workflows...
 */
export const useSuiteSession = create<WidgetSession>((set, get) => ({
  busterState: 'idle',
  workflowExecutionService: null,
  initWorkflowExecutionService: (
    workflows: AggregatedWorkflow[],
    executeStep: (step: ParsedStep) => void
  ) => {
    const service = new WorkflowExecutionService(workflows, executeStep);
    set({ workflowExecutionService: service });
    return service;
  },
  setBusterState: state => set({ busterState: state }),
  panelOpen: false,
  togglePanel: () => set({ panelOpen: !get().panelOpen }),
  setPanelOpen: open => set({ panelOpen: open }),
  screen: Screen.Home,
  setScreen: screen => set({ screen }),
  user: undefined,
  inputValue: '',
  setInputValue: value => set({ inputValue: value }),
  agent: undefined,
  messages: [],
  isLoadingMessages: false,
  isAgentThinking: false,
  setIsAgentThinking: isThinking => set({ isAgentThinking: isThinking }),
  setUser: user => set({ user }),
  setAgent: agent => set({ agent }),
  setMessages: messages => set({ messages }),
  addMessage: message => set({ messages: [...(get().messages || []), message] }),
  fetchMessages: async () => {
    try {
      set({ isLoadingMessages: true });
      const agent = get().agent;
      const user = get().user;
      if (!agent?.id || !user?.id) {
        throw new Error('Agent or user not found');
      }
      const messages: Message[] = await suiteCoreService.call(
        'conversations',
        'getMessagesOfAgentAndUser',
        [agent.id, user.id, true]
      );
      const parsedMessage: ParsedMessage[] = messages.map(message => {
        const messageContent = JSON.parse(message.content) as MessageContent;
        return {
          ...message,
          ...messageContent,
        };
      });
      set({ messages: parsedMessage, isLoadingMessages: false });
      return parsedMessage;
    } catch (error) {
      set({ isLoadingMessages: false });
      throw new Error(`Failed to fetch messages: ${error}`);
    }
  },
  createUserFromAddressIfNotExist: async walletAddress => {
    try {
      const user = await userService.createUserIfNotExist(walletAddress);
      set({ user });
      return user;
    } catch (error) {
      throw new Error(`Failed to fetch user from wallet address: ${error}`);
    }
  },
  fetchOrganizationAgentById: async (agentId, apiKey) => {
    try {
      const agent = await suiteCoreService.callDatabaseService('agents', 'getOneByFields', [
        {
          id: agentId,
          organization_id: apiKey,
        },
      ]);
      set({ agent: agent as any });
      return agent as any;
    } catch (error) {
      throw new Error(`Failed to fetch agent by ID: ${error}`);
    }
  },
}));
