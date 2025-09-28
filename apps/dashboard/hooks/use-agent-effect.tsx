import { api } from '@/trpc/react';
import { useEffect } from 'react';

import { useDashboardState } from './use-dashboard';
import { useAgentUsersCountQuery, useInfiniteAgentUsersQuery } from './use-dashboard-queries';

export const useAgentUsersEffect = (agentId: string) => {
  const { setSelectedAgentUser: setSelectedUser, selectedAgentUser: selectedUser } =
    useDashboardState();

  const {
    data: users = [],
    isLoading,
    error,
  } = api.user.getUsersByAgentId.useQuery(agentId, {
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser, setSelectedUser]);

  return {
    status: isLoading ? 'loading' : error ? 'error' : 'idle',
    users,
    selectedUser,
    error,
  };
};

export const useSelectedAgentUsersEffect = () => {
  const { selectedAgent } = useDashboardState();

  const {
    data: agentUsers = [],
    isLoading,
    error,
  } = api.user.getUsersByAgentId.useQuery(selectedAgent?.id || '', {
    enabled: !!selectedAgent?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    status: isLoading ? 'loading' : error ? 'error' : 'idle',
    agentUsers,
    error,
  };
};

export const useAgentUsersInfinite = (agentId: string, pageSize = 10) => {
  const { data: totalUsers } = useAgentUsersCountQuery(agentId);
  // Use infinite query for organization users (no fallback to avoid loading all users)
  const {
    data: infiniteUsersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteAgentUsersQuery(agentId, totalUsers, pageSize, !!agentId);

  // Only use infinite query data - no fallback to avoid loading all 500 users
  const allUsers = infiniteUsersData?.pages.flatMap(page => page.users) || [];

  return {
    agentUsers: allUsers,
    agentUserStatus: !infiniteUsersData ? 'loading' : isLoading ? 'loading' : 'idle',
    refresh: () => {
      refetch();
    },
    // Infinite loading functions
    loadMoreUsers: fetchNextPage,
    hasMoreUsers: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    totalUsers,
  };
};
