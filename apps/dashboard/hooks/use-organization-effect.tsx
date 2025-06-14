import { useEffect } from 'react';

import { useDashboardState } from './use-dashboard';

export const useOrganizationUsersEffect = (organizationId: string) => {
  const { fetchUsersByOrganizationId, organizationUsers, organizationUserStatus } =
    useDashboardState();
  useEffect(() => {
    fetchUsersByOrganizationId(organizationId);
  }, [organizationId]);
  return { organizationUsers, organizationUserStatus };
};

export const useSelectedOrganizationUsersEffect = () => {
  const { selectedOrganization } = useDashboardState();
  return useOrganizationUsersEffect(selectedOrganization?.id || '');
};
