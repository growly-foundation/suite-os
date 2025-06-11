'use client';

import { UsersConversationSidebar } from '@/components/app-users/app-user-conversation-sidebar';
import { UserDetails } from '@/components/app-users/app-user-details';
import { ConversationArea } from '@/components/conversations/conversation-area';
import { useDashboardState } from '@/hooks/use-dashboard';
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
    <div className="flex w-full overflow-hidden h-[85.2vh]">
      {userStatus === 'loading' ? (
        <div className="flex w-full items-center justify-center h-full">
          <AnimatedLoadingSmall />
        </div>
      ) : users.length > 0 && selectedUser ? (
        <>
          <UsersConversationSidebar
            users={users}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
          />
          <ConversationArea selectedUser={selectedUser} />
          <div className="w-[360px] border-l flex flex-col bg-slate-50/50">
            <UserDetails user={selectedUser} />
          </div>
        </>
      ) : (
        <div className="flex w-full items-center justify-center h-full">
          <span className="text-muted-foreground">No conversations found.</span>
        </div>
      )}
    </div>
  );
}
