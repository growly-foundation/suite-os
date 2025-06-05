'use client';

import { UserDetails } from '@/components/app-users/app-user-details';
import { UsersList } from '@/components/app-users/app-user-list';
import { ConversationArea } from '@/components/conversations/conversation-area';
import { useDashboardState } from '@/hooks/use-dashboard';
import { Loader } from 'lucide-react';
import { useEffect } from 'react';

import { AggregatedAgent } from '@getgrowly/core';

import { AnimatedLoadingSmall } from '../animated-components/animated-loading-small';

export function AgentConversations({ agent }: { agent: AggregatedAgent }) {
  const { users, fetchUsersByAgentId, userStatus, selectedUser, setSelectedUser } =
    useDashboardState();

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await fetchUsersByAgentId(agent.id);
      if (users.length > 0) {
        setSelectedUser(users[0]);
      }
    };
    fetchUsers();
  }, [agent]);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex h-[85.2vh]">
        {userStatus === 'loading' ? (
          <div className="flex w-full items-center justify-center h-full">
            <AnimatedLoadingSmall />
          </div>
        ) : users.length > 0 && selectedUser ? (
          <>
            <UsersList users={users} selectedUser={selectedUser} onSelectUser={setSelectedUser} />
            <ConversationArea selectedUser={selectedUser} />
            <UserDetails user={selectedUser} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader className="animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
