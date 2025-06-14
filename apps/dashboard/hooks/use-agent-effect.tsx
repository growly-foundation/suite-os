import { useEffect } from 'react';

import { useDashboardState } from './use-dashboard';

export const useAgentUsersEffect = (agentId: string) => {
  const {
    fetchUsersByAgentId,
    setSelectedAgentUser: setSelectedUser,
    selectedAgentUser: selectedUser,
    agentUsers: users,
  } = useDashboardState();

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await fetchUsersByAgentId(agentId);
      if (users.length > 0) {
        setSelectedUser(users[0]);
      }
    };
    fetchUsers();
  }, [agentId]);

  return { users, selectedUser };
};

export const useSelectedAgentUsersEffect = () => {
  const { fetchUsersByAgentId, selectedAgent, agentUsers, agentUserStatus } = useDashboardState();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!selectedAgent) return;
      await fetchUsersByAgentId(selectedAgent.id);
    };
    fetchUsers();
  }, [selectedAgent]);

  return { agentUsers, agentUserStatus };
};
