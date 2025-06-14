import { useEffect } from 'react';

import { useDashboardState } from './use-dashboard';

export const useOrganizationEffect = (organizationId: string) => {
  const {
    fetchUsersByOrganizationId,
    setSelectedAgentUser: setSelectedUser,
    selectedAgentUser: selectedUser,
    agentUsers: users,
  } = useDashboardState();

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await fetchUsersByOrganizationId(organizationId);
      if (users.length > 0) {
        setSelectedUser(users[0]);
      }
    };
    fetchUsers();
  }, [organizationId]);

  return { users, selectedUser };
};
