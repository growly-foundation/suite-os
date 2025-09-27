import { suiteCore } from '@/core/suite';
import { uploadToSupabase } from '@/utils/supabase-storage';
import { toast } from 'react-toastify';
import { create } from 'zustand';

import {
  Admin,
  Agent,
  AggregatedAgent,
  AggregatedOrganization,
  AggregatedWorkflow,
  MessageContent,
  ParsedMessage,
  ParsedResource,
  ParsedUser,
  Resource,
  WorkflowId,
  generateHandle,
} from '@getgrowly/core';

export const STORAGE_KEY_SELECTED_ORGANIZATION_ID = (userId: string) =>
  `SUITE_SELECTED_ORGANIZATION_ID_${userId}`;

export type StateStatus = 'idle' | 'loading';

export type ConversationStatus = StateStatus | 'sending' | 'agent-thinking';

const handleOrganizationLogoUpload = async (logoFile: File | null | undefined, handle: string) => {
  // Handle logo upload if provided
  let logoUrl = null;
  if (logoFile) {
    toast.info('Uploading company logo...');
    try {
      logoUrl = await uploadToSupabase(logoFile, 'organizations', `org-${handle}`);
      if (!logoUrl) throw new Error('Logo upload failed');
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Logo upload failed:', error);
      toast.warning('Logo upload failed, but organization will still be created');
    }
  }
  return logoUrl;
};

/**
 * State storage for managing application state.
 */
export type DashboardAppState = {
  // Authentication
  authStatus: StateStatus;
  admin: Admin | null;
  setAdmin: (user: Admin | null) => void;

  // Selected Organization
  selectedOrganization: AggregatedOrganization | null;
  setSelectedOrganization: (organization: AggregatedOrganization | undefined) => void;

  // Organizations
  organizationStatus: StateStatus;
  fetchOrganizations: () => Promise<AggregatedOrganization[]>;
  organizations: AggregatedOrganization[];
  setOrganizations: (organizations: AggregatedOrganization[]) => void;
  createOrganization: (
    name: string,
    description: string,
    creatorRole: string,
    handle?: string,
    logoFile?: File,
    referralSource?: string
  ) => Promise<AggregatedOrganization>;
  updateOrganization: (
    organizationId: string,
    name: string,
    description: string,
    handle?: string,
    logoFile?: File,
    referralSource?: string
  ) => Promise<AggregatedOrganization>;

  // Organization Resources
  organizationResourceStatus: StateStatus;
  organizationResources: Resource[];
  setOrganizationResources: (resources: Resource[]) => void;
  fetchCurrentOrganizationResources: () => Promise<Resource[]>;

  // Agent Users
  organizationUserStatus: StateStatus;
  organizationUsers: ParsedUser[];
  fetchUserById: (userId: string) => Promise<ParsedUser | null>;
  selectedOrganizationUser: ParsedUser | null;
  setSelectedOrganizationUser: (user: ParsedUser | null) => void;

  // Agent Resources
  setAgentResources: (resources: Resource[]) => void;
  fetchAgentResources: (agentId: string) => Promise<Resource[]>;
  fetchCurrentAgentResources: () => Promise<Resource[]>;

  // Workflows
  /**
   * @deprecated not released in Suite MVP
   */
  workflowStatus: StateStatus;
  /**
   * @deprecated not released in Suite MVP
   */
  organizationWorkflows: AggregatedWorkflow[];
  /**
   * @deprecated not released in Suite MVP
   */
  getOrganizationWorkflows: (workflowId: WorkflowId) => AggregatedWorkflow | undefined;
  /**
   * @deprecated not released in Suite MVP
   */
  setOrganizationWorkflows: (workflows: AggregatedWorkflow[]) => void;
  /**
   * @deprecated not released in Suite MVP
   */
  fetchOrganizationWorkflows: () => Promise<AggregatedWorkflow[]>;
  /**
   * @deprecated not released in Suite MVP
   */
  fetchOrganizationWorkflowById: (workflowId: WorkflowId) => Promise<AggregatedWorkflow | null>;

  // Agents
  agentStatus: StateStatus;
  organizationAgents: Agent[];
  fetchOrganizationAgents: () => Promise<Agent[]>;
  fetchOrganizationAgentById: (agentId: string) => Promise<AggregatedAgent | null>;
  selectedAgent: AggregatedAgent | null;
  setSelectedAgent: (agent: AggregatedAgent | null) => void;

  // Agent Users (deprecated - now using tRPC)
  agentUserStatus: StateStatus;
  agentUsers: ParsedUser[];
  selectedAgentUser: ParsedUser | null;
  setSelectedAgentUser: (user: ParsedUser | null) => void;

  // Messages
  conversationStatus: ConversationStatus;
  setConversationStatus: (status: ConversationStatus) => void;
  currentConversationMessages: ParsedMessage[];
  addConversationMessage: (message: ParsedMessage) => void;
  fetchCurrentConversationMessages: (showLoading?: boolean) => Promise<ParsedMessage[]>;

  resetDashboardState: () => void;
};

/**
 * Hook for managing application state.
 */
export const useDashboardState = create<DashboardAppState>((set, get) => ({
  // Authentication
  authStatus: 'idle',
  admin: null,
  setAdmin: (admin: Admin | null) => set({ admin }),

  // Selected Organization
  organizationStatus: 'idle',
  selectedOrganization: null,
  setSelectedOrganization: (organization: AggregatedOrganization | undefined) => {
    const admin = get().admin;
    if (!admin?.id) throw new Error('No admin authenticated');
    if (organization) {
      localStorage.setItem(STORAGE_KEY_SELECTED_ORGANIZATION_ID(admin.id), organization.id);
    } else {
      localStorage.removeItem(STORAGE_KEY_SELECTED_ORGANIZATION_ID(admin.id));
    }
    set({ selectedOrganization: organization });
  },

  // Organization Users
  organizationUserStatus: 'idle',
  organizationUsers: [],
  fetchUserById: async (userId: string) => {
    const user = await suiteCore.users.getUserById(userId);
    return user;
  },
  selectedOrganizationUser: null,
  setSelectedOrganizationUser: (user: ParsedUser | null) => set({ selectedOrganizationUser: user }),

  // Agents
  agentStatus: 'idle',
  organizationAgents: [],
  fetchOrganizationAgents: async () => {
    set({ agentStatus: 'loading' });
    const selectedOrganization = get().selectedOrganization;
    if (!selectedOrganization) throw new Error('No organization selected');

    const agents = await suiteCore.agents.getAgentsByOrganizationId(selectedOrganization.id);
    set({
      organizationAgents: agents,
      agentStatus: 'idle',
    });
    return agents;
  },
  fetchOrganizationAgentById: async (agentId: string) => {
    set({ agentStatus: 'loading' });
    const selectedOrganization = get().selectedOrganization;
    if (!selectedOrganization) throw new Error('No organization selected');

    const agent = await suiteCore.agents.getAggregatedAgent(agentId);
    if (!agent) throw new Error('Agent not found');
    set(state => ({
      organizationAgents: state.organizationAgents.map(a => (a.id === agentId ? agent : a)),
      agentStatus: 'idle',
    }));
    return agent;
  },
  selectedAgent: null,
  setSelectedAgent: (agent: AggregatedAgent | null) => set({ selectedAgent: agent }),

  // Agent Resources
  setAgentResources: (resources: Resource[]) => {
    const selectedAgent = get().selectedAgent;
    if (!selectedAgent) return;
    set({
      selectedAgent: {
        ...selectedAgent,
        resources: resources as ParsedResource[],
      },
    });
  },
  fetchAgentResources: async (agentId: string) => {
    const agentResourceIds = await suiteCore.db.agent_resources.getAllByFields({
      agent_id: agentId,
    });
    const resources = await suiteCore.db.resources.getManyByFields(
      'id',
      agentResourceIds.map(ar => ar.resource_id)
    );
    return resources;
  },
  fetchCurrentAgentResources: async () => {
    const selectedAgent = get().selectedAgent;
    if (!selectedAgent) throw new Error('No agent selected');
    return await get().fetchAgentResources(selectedAgent.id);
  },

  // Organizations
  organizations: [],
  setOrganizations: (organizations: AggregatedOrganization[]) => set({ organizations }),
  fetchOrganizations: async () => {
    set({ organizationStatus: 'loading' });
    const admin = get().admin;
    if (!admin || !admin.id) throw new Error('No admin authenticated');
    const organizations = await suiteCore.organizations.getOrganizationsByAdminId(admin.id);
    set({ organizations, organizationStatus: 'idle' });
    return organizations;
  },
  createOrganization: async (
    name: string,
    description: string,
    creatorRole: string,
    handle?: string,
    logoFile?: File,
    referralSource?: string
  ) => {
    set({ organizationStatus: 'loading' });
    const admin = get().admin;
    if (!admin || !admin.id) throw new Error('No admin authenticated');

    handle = handle || generateHandle(name);
    const logoUrl = await handleOrganizationLogoUpload(logoFile, handle);
    const organization = await suiteCore.organizations.createOrganization(
      name,
      description,
      admin.id,
      creatorRole,
      handle,
      logoUrl,
      referralSource
    );
    set({ organizations: [...get().organizations, organization], organizationStatus: 'idle' });
    return organization;
  },
  updateOrganization: async (
    organizationId: string,
    name: string,
    description: string,
    handle?: string | null | undefined,
    logoFile?: File | null | undefined,
    referralSource?: string | null | undefined
  ) => {
    set({ organizationStatus: 'loading' });
    const admin = get().admin;
    if (!admin || !admin.id) throw new Error('No admin authenticated');

    const organization = await suiteCore.organizations.getOrganizationById(organizationId);
    if (!organization) throw new Error('Organization not found');

    handle = handle || generateHandle(name);
    const logoUrl = await handleOrganizationLogoUpload(logoFile, handle);
    const updatedOrganization = await suiteCore.db.organizations.update(organizationId, {
      name: name || organization.name,
      description: description || organization.description,
      handle: handle || organization.handle,
      logo_url: logoUrl || organization.logo_url,
      referral_source: referralSource || organization.referral_source,
    });
    const updateOrganizations = get().organizations.map(org =>
      org.id === organizationId ? { ...org, ...updatedOrganization } : org
    );
    set({ organizations: updateOrganizations, organizationStatus: 'idle' });
    return {
      ...organization,
      ...updatedOrganization,
    };
  },

  // Organization Resources
  organizationResourceStatus: 'idle',
  organizationResources: [],
  setOrganizationResources: (resources: Resource[]) => set({ organizationResources: resources }),
  fetchCurrentOrganizationResources: async () => {
    try {
      const selectedOrganization = get().selectedOrganization;
      if (!selectedOrganization) throw new Error('No organization selected');

      set({ organizationResourceStatus: 'loading' });
      const resources = await suiteCore.db.resources.getAllByFields({
        organization_id: selectedOrganization.id,
      });
      set({ organizationResources: resources, organizationResourceStatus: 'idle' });
      return resources;
    } catch (error) {
      set({ organizationResourceStatus: 'idle' });
      return [];
    }
  },

  // Workflows
  workflowStatus: 'idle',
  organizationWorkflows: [],
  getOrganizationWorkflows: (workflowId: string) =>
    get().organizationWorkflows.find(workflow => workflow.id === workflowId),
  setOrganizationWorkflows: (workflows: AggregatedWorkflow[]) =>
    set({ organizationWorkflows: workflows }),
  fetchOrganizationWorkflows: async () => {
    // set({ workflowStatus: 'loading' });
    // const selectedOrganization = get().selectedOrganization;
    // if (!selectedOrganization) throw new Error('No organization selected');

    // const aggregatedWorkflows: AggregatedWorkflow[] =
    //   await suiteCore.workflows.getWorkflowsByOrganizationId(selectedOrganization.id);
    // set({ organizationWorkflows: aggregatedWorkflows, workflowStatus: 'idle' });
    // return aggregatedWorkflows;
    return [];
  },

  // Steps
  fetchOrganizationWorkflowById: async (_workflowId: string) => {
    // set({ workflowStatus: 'loading' });
    // const selectedOrganization = get().selectedOrganization;
    // if (!selectedOrganization) throw new Error('No organization selected');

    // const workflow = await suiteCore.workflows.getWorkflowWithSteps(workflowId);
    // if (!workflow) throw new Error('Workflow not found');
    // set(state => ({
    //   organizationWorkflows: state.organizationWorkflows.map(w =>
    //     w.id === workflowId ? workflow : w
    //   ),
    //   workflowStatus: 'idle',
    // }));
    // return workflow;
    return null;
  },

  // Users (deprecated - now using tRPC)
  agentUserStatus: 'idle',
  agentUsers: [],
  selectedAgentUser: null,
  setSelectedAgentUser: (user: ParsedUser | null) => set({ selectedAgentUser: user }),

  // Conversations
  currentConversationMessages: [],
  conversationStatus: 'idle',
  setConversationStatus: (status: ConversationStatus) => set({ conversationStatus: status }),
  addConversationMessage: (message: ParsedMessage) =>
    set(state => ({
      currentConversationMessages: [...state.currentConversationMessages, message],
    })),
  fetchCurrentConversationMessages: async (showLoading = true) => {
    try {
      if (showLoading) {
        set({ conversationStatus: 'loading' });
      }
      const agent = get().selectedAgent;
      const user = get().selectedAgentUser;
      if (!agent?.id || !user?.id) {
        throw new Error('Agent or user not found');
      }
      const messages = await suiteCore.conversations.getMessagesOfAgentAndUser(
        agent.id,
        user.id,
        true
      );
      const parsedMessages: ParsedMessage[] = messages.map(message => {
        const messageContent = JSON.parse(message.content) as MessageContent;
        return {
          ...message,
          ...messageContent,
        };
      });
      if (showLoading) {
        set({ currentConversationMessages: parsedMessages, conversationStatus: 'idle' });
      } else {
        set({ currentConversationMessages: parsedMessages });
      }
      return parsedMessages;
    } catch (error) {
      if (showLoading) {
        set({ conversationStatus: 'idle' });
      }
      throw new Error(`Failed to fetch messages: ${error}`);
    }
  },
  resetDashboardState: () => {
    // Only reset state properties, not function properties
    set(state => ({
      ...state, // Keep all function properties intact
      authStatus: 'idle',
      admin: null,
      organizationStatus: 'idle',
      selectedOrganization: null,
      organizationAgents: [],
      organizationUsers: [],
      organizationWorkflows: [],
      organizationResources: [],
      selectedAgent: null,
      selectedAgentUser: null,
      currentConversationMessages: [],
      conversationStatus: 'idle',
      agentUserStatus: 'idle',
      agentUsers: [],
      agentStatus: 'idle',
      organizationUserStatus: 'idle',
      organizationResourceStatus: 'idle',
    }));
  },
}));
