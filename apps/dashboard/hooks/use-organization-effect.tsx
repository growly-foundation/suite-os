import { useDashboardState } from './use-dashboard';
import {
  useInfiniteOrganizationUsersQuery,
  useOrganizationUsersCountQuery,
} from './use-dashboard-queries';

export const useOrganizationUsersEffect = (organizationId: string, pageSize = 10) => {
  const { data: totalUsers } = useOrganizationUsersCountQuery(organizationId);
  // Use infinite query for organization users (no fallback to avoid loading all users)
  const {
    data: infiniteUsersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteOrganizationUsersQuery(organizationId, totalUsers, pageSize, !!organizationId);

  // Only use infinite query data - no fallback to avoid loading all 500 users
  const allUsers = infiniteUsersData?.pages.flatMap(page => page.users) || [];

  return {
    organizationUsers: allUsers,
    organizationUserStatus: isLoading ? 'loading' : 'idle',
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

export const useSelectedOrganizationUsersEffect = (pageSize = 10) => {
  const { selectedOrganization } = useDashboardState();
  return useOrganizationUsersEffect(selectedOrganization?.id || '', pageSize);
};
