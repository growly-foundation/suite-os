'use client';

import { UsersConversationSidebar } from '@/components/app-users/app-user-conversation-sidebar';
import { ConversationArea } from '@/components/conversations/conversation-area';
import { consumePersona } from '@/core/persona';
import { useAgentUsersEffect } from '@/hooks/use-agent-effect';
import { useChatActions } from '@/hooks/use-chat-actions';
import { useDashboardState } from '@/hooks/use-dashboard';
import {
  useConversationsCountQuery,
  useConversationsWithMessagesQuery,
} from '@/hooks/use-dashboard-queries';
import { Sidebar } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';

import {
  AggregatedAgent,
  ConversationRoleKey,
  LatestConversation,
  ParsedUser,
} from '@getgrowly/core';
import { truncateAddress } from '@getgrowly/ui';

import { AnimatedLoadingSmall } from '../animated-components/animated-loading-small';
import { AppUserAvatarWithStatus } from '../app-users/app-user-avatar-with-status';
import { UserDetails } from '../app-users/app-user-details';
import { InteractableIcon } from '../ui/interactable-icon';
import { ResizableSheet } from '../ui/resizable-sheet';

export type UserWithLatestMessage = {
  user: ParsedUser;
  latestMessageDate: string | null;
  latestMessageSender: ConversationRoleKey | null;
  latestMessageContent: string | null;
};

export function AgentConversations({ agent }: { agent: AggregatedAgent }) {
  const { setSelectedAgentUser, fetchCurrentConversationMessages } = useDashboardState();
  const [usersWithLatestMessage, setUsersWithLatestMessage] = React.useState<
    UserWithLatestMessage[]
  >([]);
  const PAGE_SIZE = 10;

  const { selectedUser, users, status } = useAgentUsersEffect(agent.id);
  const [open, setOpen] = React.useState(false);
  const persona = selectedUser ? consumePersona(selectedUser) : null;

  // React Query hooks for conversations
  const {
    data: conversationsWithMessages = [],
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useConversationsWithMessagesQuery(agent.id, PAGE_SIZE);

  const { data: totalConversations = 0 } = useConversationsCountQuery(agent.id);

  // Chat actions with real-time messaging
  const { sendAdminMessage, markAsRead, isConnected, typingUsers, realtimeMessages } =
    useChatActions();

  // Process conversations data when it loads
  useEffect(() => {
    if (conversationsWithMessages.length > 0 && users.length > 0) {
      const newUsersWithMessages = conversationsWithMessages
        .map(
          (conversation: LatestConversation & { userId: string }): UserWithLatestMessage | null => {
            const user = users.find(u => u.id === conversation.userId);
            if (!user) return null;

            return {
              user,
              latestMessageDate: conversation.message.created_at || null,
              latestMessageSender: conversation.message.sender,
              latestMessageContent: conversation.message.content || null,
            };
          }
        )
        .filter((item): item is UserWithLatestMessage => item !== null);

      setUsersWithLatestMessage(newUsersWithMessages);
    }
  }, [conversationsWithMessages, users]);

  // Update latest messages when real-time messages arrive
  useEffect(() => {
    if (realtimeMessages.length > 0) {
      const latestMessage = realtimeMessages[realtimeMessages.length - 1];
      setUsersWithLatestMessage(prev =>
        prev.map(userWithMessage => {
          if (userWithMessage.user.id === latestMessage.senderId) {
            return {
              ...userWithMessage,
              latestMessageDate: latestMessage.timestamp,
              latestMessageSender: 'user' as ConversationRoleKey,
              latestMessageContent: latestMessage.content,
            };
          } else if (agent.id === latestMessage.senderId) {
            return {
              ...userWithMessage,
              latestMessageDate: latestMessage.timestamp,
              latestMessageSender: 'assistant' as ConversationRoleKey,
              latestMessageContent: latestMessage.content,
            };
          }
          return userWithMessage;
        })
      );
      fetchCurrentConversationMessages(false);
    }
  }, [realtimeMessages, agent.id, fetchCurrentConversationMessages]);

  // Handle loading more data - for now, just refetch all conversations
  const handleLoadMore = useCallback(() => {
    refetchConversations();
  }, [refetchConversations]);

  // Send message from admin
  const handleSendMessage = useCallback(
    (content: string) => {
      sendAdminMessage(content, () => {
        // Message sent callback
        console.log('Admin message sent');
      });
    },
    [sendAdminMessage]
  );

  return (
    <div className="flex w-full overflow-hidden h-screen">
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
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingConversations}
            hasMore={usersWithLatestMessage.length < totalConversations}
          />
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <AppUserAvatarWithStatus
                  size={35}
                  walletAddress={selectedUser.entities.walletAddress}
                  name={selectedUser.name}
                  userId={selectedUser.id}
                />
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
            <div className="flex-1 min-h-0">
              <ConversationArea
                selectedUser={selectedUser}
                onSendMessage={handleSendMessage}
                onMarkAsRead={markAsRead}
                isConnected={isConnected}
                typingUsers={typingUsers}
              />
            </div>
          </div>
          {/* User Details Drawer */}
          <ResizableSheet className="w-full" side="right" open={open} onOpenChange={setOpen}>
            {selectedUser && <UserDetails userId={selectedUser.id} />}
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
