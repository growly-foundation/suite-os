'use client';

import {
  DASHBOARD_AGENTS_CACHE_TIME,
  DASHBOARD_MESSAGES_CACHE_TIME,
  DASHBOARD_USERS_CACHE_TIME,
  DASHBOARD_WORKFLOWS_CACHE_TIME,
} from '@/constants/cache';
import { suiteCore } from '@/core/suite';
import { api } from '@/trpc/react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { MessageContent, ParsedMessage, UserImportSource } from '@getgrowly/core';

const MAX_RECENT_MESSAGES = 5;

/**
 * Custom hook to fetch organization agents with React Query
 */
export function useOrganizationAgentsQuery(organizationId?: string, enabled = true) {
  return useQuery({
    queryKey: ['organizationAgents', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      // Use the same method as in useDashboardState
      return await suiteCore.agents.getAgentsByOrganizationId(organizationId);
    },
    enabled: !!organizationId && enabled,
    gcTime: DASHBOARD_AGENTS_CACHE_TIME,
    staleTime: DASHBOARD_AGENTS_CACHE_TIME / 2,
  });
}

/**
 * Custom hook to fetch organization users with React Query (using tRPC)
 */
export function useOrganizationUsersQuery(organizationId?: string, enabled = true) {
  return api.user.getUsersByOrganizationId.useQuery(organizationId || '', {
    enabled: !!organizationId && enabled,
    gcTime: DASHBOARD_USERS_CACHE_TIME,
    staleTime: DASHBOARD_USERS_CACHE_TIME / 2,
  });
}

/**
 * Custom hook to fetch organization workflows with React Query
 */
export function useOrganizationWorkflowsQuery(organizationId?: string, enabled = true) {
  return useQuery({
    queryKey: ['organizationWorkflows', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      // Based on the implementation in useDashboardState
      // return await suiteCore.workflows.getWorkflowsByOrganizationId(organizationId);
      return [];
    },
    enabled: !!organizationId && enabled,
    gcTime: DASHBOARD_WORKFLOWS_CACHE_TIME,
    staleTime: DASHBOARD_WORKFLOWS_CACHE_TIME / 2,
  });
}

/**
 * Custom hook to fetch organization resources with React Query
 */
export function useOrganizationResourcesQuery(organizationId?: string, enabled = true) {
  return useQuery({
    queryKey: ['organizationResources', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      // Based on the implementation in useDashboardState
      return await suiteCore.db.resources.getAllByFields({
        organization_id: organizationId,
      });
    },
    enabled: !!organizationId && enabled,
    gcTime: DASHBOARD_WORKFLOWS_CACHE_TIME, // Reuse cache time for resources
    staleTime: DASHBOARD_WORKFLOWS_CACHE_TIME / 2,
  });
}

/**
 * Custom hook to fetch recent messages for users with React Query
 */
export function useRecentMessagesQuery(userIds: string[], limit = 5, enabled = true) {
  return useQuery({
    queryKey: ['recentMessages', userIds, limit],
    queryFn: async () => {
      if (!userIds.length) return [];

      const messages = await suiteCore.db.messages.getManyByFields('sender_id', userIds, limit, {
        field: 'created_at',
        ascending: false,
      });

      return messages.map(message => {
        const messageContent = JSON.parse(message.content) as MessageContent;
        return {
          ...message,
          ...messageContent,
        } as ParsedMessage;
      });
    },
    enabled: userIds.length > 0 && enabled,
    gcTime: DASHBOARD_MESSAGES_CACHE_TIME,
    staleTime: DASHBOARD_MESSAGES_CACHE_TIME / 2,
  });
}

/**
 * Custom hook to fetch conversation messages between agent and user with React Query
 */
export function useConversationMessagesQuery(agentId?: string, userId?: string, enabled = true) {
  return useQuery({
    queryKey: ['conversationMessages', agentId, userId],
    queryFn: async () => {
      if (!agentId || !userId) return [];

      const messages = await suiteCore.conversations.getMessagesOfAgentAndUser(
        agentId,
        userId,
        true
      );

      return messages.map(message => {
        const messageContent = JSON.parse(message.content) as MessageContent;
        return {
          ...message,
          ...messageContent,
        } as ParsedMessage;
      });
    },
    enabled: !!agentId && !!userId && enabled,
    gcTime: DASHBOARD_MESSAGES_CACHE_TIME,
    staleTime: DASHBOARD_MESSAGES_CACHE_TIME / 2,
  });
}

/**
 * Custom hook for infinite loading of conversations with messages for sidebar
 */
export function useInfiniteConversationsWithMessagesQuery(
  agentId?: string,
  pageSize = 10,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: ['infiniteConversationsWithMessages', agentId, pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      if (!agentId) return { conversations: [], hasMore: false, nextPage: null };

      const offset = pageParam * pageSize;

      try {
        // Use server-side pagination
        const [conversations, total] = await Promise.all([
          suiteCore.conversations.getPaginatedLatestConversations(agentId, pageSize, offset),
          suiteCore.conversations.getConversationsWithMessagesCount(agentId),
        ]);

        const hasMore = offset + pageSize < total;

        return {
          conversations,
          hasMore,
          nextPage: hasMore ? pageParam + 1 : null,
          total,
        };
      } catch (error) {
        console.error('Error fetching conversations:', error);
        return { conversations: [], hasMore: false, nextPage: null, total: 0 };
      }
    },
    placeholderData: keepPreviousData,
    getNextPageParam: lastPage => lastPage.nextPage,
    enabled: !!agentId && enabled,
    gcTime: DASHBOARD_USERS_CACHE_TIME * 2, // Keep in cache for 6 minutes (3 * 2)
    staleTime: DASHBOARD_USERS_CACHE_TIME, // Consider stale after 3 minutes
    initialPageParam: 0,
    retry: 1, // Limit retries to prevent infinite loops
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch when reconnecting
  });
}

/**
 * Custom hook to get total conversations count with React Query
 */
export function useConversationsCountQuery(agentId?: string, enabled = true) {
  return useQuery({
    queryKey: ['conversationsCount', agentId],
    queryFn: async () => {
      if (!agentId) return 0;
      return await suiteCore.conversations.getConversationsWithMessagesCount(agentId);
    },
    enabled: !!agentId && enabled,
    gcTime: DASHBOARD_MESSAGES_CACHE_TIME,
    staleTime: DASHBOARD_MESSAGES_CACHE_TIME / 2,
  });
}

/**
 * Custom hook for infinite loading of organization users with React Query (using tRPC)
 */
export function useInfiniteOrganizationUsersQuery(
  organizationId?: string,
  totalUsersCount = 100,
  pageSize = 20,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: ['infiniteOrganizationUsers', organizationId, pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      if (!organizationId) return { users: [], hasMore: false, nextPage: null };

      const offset = pageParam * pageSize;

      // Use suiteCore for server-side pagination (tRPC client not available in queryFn)
      const users = await suiteCore.users.getUsersByOrganizationId(
        organizationId,
        pageSize,
        offset
      );

      const hasMore = offset + pageSize < totalUsersCount;

      return {
        users,
        hasMore,
        nextPage: hasMore ? pageParam + 1 : null,
        total: totalUsersCount,
      };
    },
    getNextPageParam: lastPage => lastPage.nextPage,
    enabled: !!organizationId && enabled,
    gcTime: DASHBOARD_USERS_CACHE_TIME,
    staleTime: DASHBOARD_USERS_CACHE_TIME / 2,
    initialPageParam: 0,
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for loading of organization users count with React Query (using tRPC)
 */
export function useOrganizationUsersCountQuery(organizationId?: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: ['organizationUsersCount', organizationId],
    queryFn: async () => {
      if (!organizationId) return 0;
      // Use suiteCore for server-side pagination (tRPC client not available in queryFn)
      const totalCount = await suiteCore.users.getUsersByOrganizationIdCount(organizationId);
      return totalCount;
    },
    enabled: !!organizationId,
    gcTime: DASHBOARD_USERS_CACHE_TIME,
    staleTime: DASHBOARD_USERS_CACHE_TIME / 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for infinite loading of agent users with React Query (using tRPC)
 */
export function useInfiniteAgentUsersQuery(
  agentId?: string,
  totalUsersCount = 100,
  pageSize = 20,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: ['infiniteAgentUsers', agentId, pageSize],
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam = 0 }) => {
      if (!agentId) return { users: [], hasMore: false, nextPage: null };

      const offset = pageParam * pageSize;

      // Use suiteCore for server-side pagination (tRPC client not available in queryFn)
      const users = await suiteCore.users.getUsersByAgentId(agentId, pageSize, offset);

      const hasMore = offset + pageSize < totalUsersCount;

      return {
        users,
        hasMore,
        nextPage: hasMore ? pageParam + 1 : null,
        total: totalUsersCount,
      };
    },
    getNextPageParam: lastPage => lastPage.nextPage,
    enabled: !!agentId && enabled,
    gcTime: DASHBOARD_USERS_CACHE_TIME,
    staleTime: DASHBOARD_USERS_CACHE_TIME / 2,
    initialPageParam: 0,
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for loading of organization users count with React Query (using tRPC)
 */
export function useAgentUsersCountQuery(agentId?: string) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: ['agentUsersCount', agentId],
    queryFn: async () => {
      if (!agentId) return 0;
      // Use suiteCore for server-side pagination (tRPC client not available in queryFn)
      const totalCount = await suiteCore.users.getUsersByAgentIdCount(agentId);
      return totalCount;
    },
    enabled: !!agentId,
    gcTime: DASHBOARD_USERS_CACHE_TIME,
    staleTime: DASHBOARD_USERS_CACHE_TIME / 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Types for user mutations
 */
interface UserDeleteData {
  userIds: string[];
  organizationId?: string;
}

interface UserCreateData {
  walletAddress: string;
  organizationId: string;
  importedSourceData?: {
    source: UserImportSource;
    sourceData: Record<string, unknown>;
  };
}

/**
 * Custom hook for user deletion mutation with cache invalidation
 */
export function useDeleteUsersMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userIds }: UserDeleteData) => {
      return suiteCore.users.deleteUsers(userIds);
    },
    onSuccess: () => {
      // Invalidate user queries to refresh the data
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: ['organizationUsers', organizationId] });
        queryClient.invalidateQueries({ queryKey: ['infiniteOrganizationUsers', organizationId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['organizationUsers'] });
        queryClient.invalidateQueries({ queryKey: ['infiniteOrganizationUsers'] });
      }
    },
  });
}

/**
 * Custom hook for user creation mutation with cache invalidation
 */
export function useCreateUserMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UserCreateData) => {
      return suiteCore.users.createUserFromAddressIfNotExist(
        userData.walletAddress,
        userData.organizationId,
        userData.importedSourceData
      );
    },
    onSuccess: () => {
      // Invalidate user queries to refresh the data
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: ['organizationUsers', organizationId] });
        queryClient.invalidateQueries({ queryKey: ['infiniteOrganizationUsers', organizationId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['organizationUsers'] });
        queryClient.invalidateQueries({ queryKey: ['infiniteOrganizationUsers'] });
      }
    },
  });
}

/**
 * Types for mutations
 */
interface AgentCreateData {
  name: string;
  description?: string | null;
  model: string; // Model is required
  status?: 'active' | 'inactive';
  organization_id?: string | null;
  [key: string]: any;
}

interface AgentUpdateData {
  agentId: string;
  data: Partial<AgentCreateData>;
}

interface AgentDeleteData {
  agentId: string;
  organizationId?: string;
}

/**
 * Custom hook for agent creation mutation with cache invalidation
 */
export function useCreateAgentMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentData: AgentCreateData) => {
      if (!organizationId) throw new Error('Organization ID is required');
      // Use suiteCore.db.agents.create or the appropriate method based on what's available
      return await suiteCore.db.agents.create({
        ...agentData,
        organization_id: organizationId,
      });
    },
    onSuccess: () => {
      // Invalidate agent queries to refresh the data
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: ['organizationAgents', organizationId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['organizationAgents'] });
      }
    },
  });
}

/**
 * Custom hook for agent update mutation with cache invalidation
 */
export function useUpdateAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, data }: AgentUpdateData) => {
      // Use suiteCore.db.agents.update or the appropriate method based on what's available
      return await suiteCore.db.agents.update(agentId, data);
    },
    onSuccess: (_, variables) => {
      // Get the organization ID from the updated agent data if available
      const organizationId = variables.data.organization_id;

      // Invalidate specific agent query and organization agents
      queryClient.invalidateQueries({ queryKey: ['agent', variables.agentId] });

      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: ['organizationAgents', organizationId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['organizationAgents'] });
      }
    },
  });
}

/**
 * Custom hook for agent deletion mutation with cache invalidation
 */
export function useDeleteAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId }: AgentDeleteData) => {
      // Use suiteCore.db.agents.delete or the appropriate method based on what's available
      return await suiteCore.db.agents.delete(agentId);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific agent query and organization agents
      queryClient.invalidateQueries({ queryKey: ['agent', variables.agentId] });

      if (variables.organizationId) {
        queryClient.invalidateQueries({
          queryKey: ['organizationAgents', variables.organizationId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['organizationAgents'] });
      }
    },
  });
}

/**
 * Types for workflow mutations
 */
interface WorkflowCreateData {
  name: string;
  description?: string | null;
  status?: 'active' | 'inactive';
  organization_id?: string | null;
  [key: string]: any;
}

interface WorkflowUpdateData {
  workflowId: string;
  data: Partial<WorkflowCreateData>;
}

interface WorkflowDeleteData {
  workflowId: string;
  organizationId?: string;
}

/**
 * Custom hook for workflow creation mutation with cache invalidation
 */
export function useCreateWorkflowMutation(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowData: WorkflowCreateData) => {
      if (!organizationId) throw new Error('Organization ID is required');
      // Use suiteCore.db.workflows.create or the appropriate method based on what's available
      return await suiteCore.db.workflows.create({
        ...workflowData,
        organization_id: organizationId,
      });
    },
    onSuccess: () => {
      // Invalidate workflow queries to refresh the data
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: ['organizationWorkflows', organizationId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['organizationWorkflows'] });
      }
    },
  });
}

/**
 * Custom hook for workflow update mutation with cache invalidation
 */
export function useUpdateWorkflowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId, data }: WorkflowUpdateData) => {
      // Use suiteCore.db.workflows.update or the appropriate method based on what's available
      return await suiteCore.db.workflows.update(workflowId, data);
    },
    onSuccess: (_, variables) => {
      // Get the organization ID from the updated workflow data if available
      const organizationId = variables.data.organization_id;

      // Invalidate specific workflow query and organization workflows
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.workflowId] });

      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: ['organizationWorkflows', organizationId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['organizationWorkflows'] });
      }
    },
  });
}

/**
 * Custom hook for workflow deletion mutation with cache invalidation
 */
export function useDeleteWorkflowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId }: WorkflowDeleteData) => {
      // Use suiteCore.db.workflows.delete or the appropriate method based on what's available
      return await suiteCore.db.workflows.delete(workflowId);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific workflow query and organization workflows
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.workflowId] });

      if (variables.organizationId) {
        queryClient.invalidateQueries({
          queryKey: ['organizationWorkflows', variables.organizationId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['organizationWorkflows'] });
      }
    },
  });
}

/**
 * Backward compatibility hooks for direct cache invalidation
 */
export function useAgentCacheInvalidation(organizationId?: string) {
  const queryClient = useQueryClient();

  // Function to invalidate agent queries
  const invalidateAgentQueries = () => {
    if (organizationId) {
      queryClient.invalidateQueries({ queryKey: ['organizationAgents', organizationId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['organizationAgents'] });
    }
  };

  // Return a function that can be called after agent mutations
  return { invalidateAgentQueries };
}

/**
 * Custom hook for cache invalidation when workflows are modified
 */
export function useWorkflowCacheInvalidation(organizationId?: string) {
  const queryClient = useQueryClient();

  // Function to invalidate workflow queries
  const invalidateWorkflowQueries = () => {
    if (organizationId) {
      queryClient.invalidateQueries({ queryKey: ['organizationWorkflows', organizationId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['organizationWorkflows'] });
    }
  };

  // Return a function that can be called after workflow mutations
  return { invalidateWorkflowQueries };
}

/**
 * Mutation hook for creating workflow steps
 */
export function useCreateStepsMutation(workflowId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stepData: any[]) => {
      if (!workflowId) throw new Error('Workflow ID is required');
      return await suiteCore.steps.createStep(stepData, workflowId);
    },
    onSuccess: () => {
      // Invalidate workflow queries to refresh the data
      if (workflowId) {
        queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
      }
      queryClient.invalidateQueries({ queryKey: ['organizationWorkflows'] });
    },
  });
}

/**
 * Combined hook for dashboard data queries with refetch functionality
 */
/**
 * Combined hook for dashboard data queries with refetch functionality
 */
export function useDashboardDataQueries(organizationId?: string, workflowId?: string) {
  const agents = useOrganizationAgentsQuery(organizationId);
  const users = useOrganizationUsersQuery(organizationId);
  const workflows = useOrganizationWorkflowsQuery(organizationId);
  const resources = useOrganizationResourcesQuery(organizationId);

  // Only fetch messages if we have users
  const userIds = users.data?.map(user => user.id) || [];
  const messages = useRecentMessagesQuery(userIds, MAX_RECENT_MESSAGES, users.isSuccess);

  // Set up agent mutation hooks
  const createAgent = useCreateAgentMutation(organizationId);
  const updateAgent = useUpdateAgentMutation();
  const deleteAgent = useDeleteAgentMutation();

  // Set up user mutation hooks
  const createUser = useCreateUserMutation(organizationId);
  const deleteUsers = useDeleteUsersMutation(organizationId);

  // Set up workflow mutation hooks
  const createWorkflow = useCreateWorkflowMutation(organizationId);
  const updateWorkflow = useUpdateWorkflowMutation();
  const deleteWorkflow = useDeleteWorkflowMutation();

  // Set up steps mutation hook (only if workflowId is provided)
  const createSteps = useCreateStepsMutation(workflowId);

  // Refetch functions to manually trigger data refresh
  const refetchAll = async () => {
    const results = await Promise.all([
      agents.refetch(),
      users.refetch(),
      workflows.refetch(),
      resources.refetch(),
      users.isSuccess ? messages.refetch() : Promise.resolve(),
    ]);
    return results;
  };

  const refetchAgents = () => agents.refetch();
  const refetchUsers = () => users.refetch();
  const refetchWorkflows = () => workflows.refetch();
  const refetchResources = () => resources.refetch();
  const refetchMessages = () => messages.refetch();

  const isLoading =
    agents.isLoading ||
    users.isLoading ||
    workflows.isLoading ||
    resources.isLoading ||
    messages.isLoading;
  const isError =
    agents.isError || users.isError || workflows.isError || resources.isError || messages.isError;

  return {
    // Query results
    agents,
    users,
    workflows,
    resources,
    messages,
    isLoading,
    isError,
    data: {
      agents: agents.data || [],
      users: users.data || [],
      workflows: workflows.data || [],
      resources: resources.data || [],
      messages: messages.data || [],
    },
    // Mutation hooks for agents
    createAgent,
    updateAgent,
    deleteAgent,
    // Mutation hooks for users
    createUser,
    deleteUsers,
    // Mutation hooks for workflows
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    // Mutation hook for workflow steps
    createSteps,
    // Refetch functions for manual refresh
    refetchAll,
    refetchAgents,
    refetchUsers,
    refetchWorkflows,
    refetchResources,
    refetchMessages,
  };
}
