'use client';

import { UsersConversationSidebar } from '@/components/app-users/app-user-conversation-sidebar';
import { ConversationArea } from '@/components/conversations/conversation-area';
import { consumePersona } from '@/core/persona';
import { suiteCore } from '@/core/suite';
import { useAgentUsersEffect } from '@/hooks/use-agent-effect';
import { useDashboardState } from '@/hooks/use-dashboard';
import { Sidebar } from 'lucide-react';
import moment from 'moment';
import React, { useCallback, useEffect } from 'react';

import { AggregatedAgent, ParsedUser } from '@getgrowly/core';
import { truncateAddress } from '@getgrowly/ui';

import { AnimatedLoadingSmall } from '../animated-components/animated-loading-small';
import { AppUserAvatarWithStatus } from '../app-users/app-user-avatar-with-status';
import { UserDetails } from '../app-users/app-user-details';
import { InteractableIcon } from '../ui/interactable-icon';
import { ResizableSheet } from '../ui/resizable-sheet';

export type UserWithLatestMessage = {
  user: ParsedUser;
  latestMessageDate: string | null;
  latestMessageContent: string | null;
};

export function AgentConversations({ agent }: { agent: AggregatedAgent }) {
  const { setSelectedAgentUser } = useDashboardState();
  const [usersWithLatestMessage, setUsersWithLatestMessage] = React.useState<
    UserWithLatestMessage[]
  >([]);
  const { selectedUser, users, status } = useAgentUsersEffect(agent.id);
  const [open, setOpen] = React.useState(false);
  const persona = selectedUser ? consumePersona(selectedUser) : null;

  const sortedUsersByLatestMessage = useCallback(async () => {
    const userWithLatestMessage = await Promise.all(
      users.map(async user => {
        try {
          const lastConversation = await suiteCore.conversations.getLatestConversationMessage(
            user.id,
            agent.id
          );
          if (!lastConversation?.message)
            return { user, latestMessageDate: null, latestMessageContent: null };
          return {
            user,
            latestMessageDate: lastConversation.message.created_at || null,
            latestMessageContent: lastConversation.message.content || null,
          };
        } catch (error) {
          console.error(`Failed to fetch latest message for user ${user.id}:`, error);
          return { user, latestMessageDate: null, latestMessageContent: null };
        }
      })
    );
    return userWithLatestMessage.sort((a, b) => {
      const latestMessageA = a.latestMessageDate;
      const latestMessageB = b.latestMessageDate;
      if (!latestMessageA && !latestMessageB) return 0;
      if (!latestMessageA) return 1; // A goes after B
      if (!latestMessageB) return -1; // A goes before B
      return moment(latestMessageB).diff(moment(latestMessageA));
    });
  }, [users]);

  useEffect(() => {
    const fetchUsersWithLatestMessage = async () => {
      const usersWithLatestMessage = await sortedUsersByLatestMessage();
      setUsersWithLatestMessage(usersWithLatestMessage);
    };
    fetchUsersWithLatestMessage();
  }, [users]);

  return (
    <div className="flex w-full overflow-hidden h-[85.1vh]">
      {status === 'loading' ? (
        <div className="flex w-full items-center justify-center h-full">
          <AnimatedLoadingSmall />
        </div>
      ) : users.length > 0 && selectedUser ? (
        <React.Fragment>
          <UsersConversationSidebar
            users={usersWithLatestMessage}
            selectedUser={selectedUser}
            onSelectUser={setSelectedAgentUser}
          />
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-3">
                <AppUserAvatarWithStatus user={selectedUser} size={35} />
                <div>
                  <p className="font-medium text-sm">
                    {persona?.nameService().name ||
                      truncateAddress(selectedUser.entities.walletAddress, 10, 4)}
                  </p>
                </div>
              </div>
              <InteractableIcon
                iconComponent={props => (
                  <Sidebar
                    onClick={() => {
                      setOpen(true);
                    }}
                    {...props}
                  />
                )}
              />
            </div>
            <ConversationArea selectedUser={selectedUser} />
          </div>
          {/* User Details Drawer */}
          <ResizableSheet side="right" open={open} onOpenChange={setOpen}>
            {selectedUser && <UserDetails user={selectedUser} />}
          </ResizableSheet>
        </React.Fragment>
      ) : (
        <div className="flex w-full items-center justify-center h-full">
          <span className="text-muted-foreground">No conversations found.</span>
        </div>
      )}
    </div>
  );
}
