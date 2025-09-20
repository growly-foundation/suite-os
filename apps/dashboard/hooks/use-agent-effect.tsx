import { useDashboardState } from './use-dashboard';
import { useAgentUsersCountQuery, useInfiniteAgentUsersQuery } from './use-dashboard-queries';

export const useAgentUsersEffect = (agentId: string, pageSize = 10) => {
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
    agentUserStatus: isLoading ? 'loading' : 'idle',
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

export const useSelectedAgentUsersEffect = (pageSize = 10) => {
  const { selectedAgent } = useDashboardState();
  return useAgentUsersEffect(selectedAgent?.id || '', pageSize);
};
