import { useEffect, useState } from 'react';

import { useDashboardState } from './use-dashboard';

export const useOrganizationUsersEffect = (organizationId: string) => {
  const [refreshing, setRefreshing] = useState(+new Date());
  const { fetchUsersByOrganizationId, organizationUsers, organizationUserStatus } =
    useDashboardState();
  useEffect(() => {
    fetchUsersByOrganizationId(organizationId);
  }, [organizationId, refreshing]);
  return { organizationUsers, organizationUserStatus, refresh: () => setRefreshing(+new Date()) };
};

export const useSelectedOrganizationUsersEffect = () => {
  const { selectedOrganization } = useDashboardState();
  return useOrganizationUsersEffect(selectedOrganization?.id || '');
};
