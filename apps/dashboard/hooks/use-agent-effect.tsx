import { trpc } from '@/trpc/client';
import { useEffect } from 'react';

import { useDashboardState } from './use-dashboard';

export const useAgentUsersEffect = (agentId: string) => {
  const { setSelectedAgentUser: setSelectedUser, selectedAgentUser: selectedUser } =
    useDashboardState();

  const {
    data: users = [],
    isLoading,
    error,
  } = trpc.user.getUsersByAgentId.useQuery(agentId, {
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
  } = trpc.user.getUsersByAgentId.useQuery(selectedAgent?.id || '', {
    enabled: !!selectedAgent?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    status: isLoading ? 'loading' : error ? 'error' : 'idle',
    agentUsers,
    error,
  };
};
