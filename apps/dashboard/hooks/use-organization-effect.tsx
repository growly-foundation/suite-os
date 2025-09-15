import { useEffect, useState } from 'react';

import { useDashboardState } from './use-dashboard';
import { useInfiniteOrganizationUsersQuery } from './use-dashboard-queries';

export const useOrganizationUsersEffect = (organizationId: string, pageSize = 10) => {
  const [refreshing, setRefreshing] = useState(+new Date());
  const { fetchUsersByOrganizationId, organizationUsers, organizationUserStatus } =
    useDashboardState();

  // Use infinite query for organization users
  const {
    data: infiniteUsersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteOrganizationUsersQuery(organizationId, pageSize, !!organizationId);

  // Fallback to old method if infinite query is not available
  useEffect(() => {
    if (!organizationId) return;
    fetchUsersByOrganizationId(organizationId);
  }, [organizationId, refreshing, fetchUsersByOrganizationId]);

  // Combine all pages of users from infinite query
  const allUsers = infiniteUsersData?.pages.flatMap(page => page.users) || organizationUsers;
  const totalUsers = infiniteUsersData?.pages[0]?.total || organizationUsers.length;

  return {
    organizationUsers: allUsers,
    organizationUserStatus: isLoading ? 'loading' : organizationUserStatus,
    refresh: () => {
      setRefreshing(+new Date());
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
