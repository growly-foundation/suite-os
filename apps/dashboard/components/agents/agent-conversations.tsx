'use client';

import { UsersConversationSidebar } from '@/components/app-users/app-user-conversation-sidebar';
import { ConversationArea } from '@/components/conversations/conversation-area';
import { useAgentUsersEffect } from '@/hooks/use-agent-effect';
import { useChatActions } from '@/hooks/use-chat-actions';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useInfiniteConversationsWithMessagesQuery } from '@/hooks/use-dashboard-queries';
import { Sidebar } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';

import {
  AggregatedAgent,
  ConversationRoleKey,
  LatestConversation,
  ParsedUser,
} from '@getgrowly/core';

import { AnimatedLoadingSmall } from '../animated-components/animated-loading-small';
import { AppUserAvatarWithStatus } from '../app-users/app-user-avatar-with-status';
import { UserDetails } from '../app-users/app-user-details';
import { Identity } from '../identity';
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

  const {
    users: agentUsers,
    status: agentUserStatus,
    selectedUser: selectedAgentUser,
  } = useAgentUsersEffect(agent.id);
  const [open, setOpen] = React.useState(false);

  // React Query hooks for conversations with infinite loading
  const {
    data: infiniteConversationsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchConversations,
  } = useInfiniteConversationsWithMessagesQuery(agent.id, PAGE_SIZE);

  // Combine all pages of conversations with memoization
  const allConversations = useMemo(() => {
    return infiniteConversationsData?.pages.flatMap(page => page.conversations) || [];
  }, [infiniteConversationsData]);

  // Chat actions with real-time messaging
  const { sendAdminMessage, markAsRead, isConnected, typingUsers, realtimeMessages } =
    useChatActions();

  // Process conversations data when it loads with memoization
  const processedUsersWithMessages = useMemo(() => {
    if (allConversations.length === 0 || agentUsers.length === 0) return [];

    return allConversations
      .map(
        (conversation: LatestConversation & { userId: string }): UserWithLatestMessage | null => {
          const user = agentUsers.find(u => u.id === conversation.userId);
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
  }, [allConversations, agentUsers]);

  // Update state when processed data changes
  useEffect(() => {
    // Only update if the data has actually changed
    setUsersWithLatestMessage(prev => {
      if (prev.length !== processedUsersWithMessages.length) {
        return processedUsersWithMessages;
      }

      // Check if any user data has changed
      const hasChanged = prev.some((prevUser, index) => {
        const newUser = processedUsersWithMessages[index];
        if (!newUser) return true;

        return (
          prevUser.user.id !== newUser.user.id ||
          prevUser.latestMessageDate !== newUser.latestMessageDate ||
          prevUser.latestMessageContent !== newUser.latestMessageContent ||
          prevUser.latestMessageSender !== newUser.latestMessageSender
        );
      });

      return hasChanged ? processedUsersWithMessages : prev;
    });
  }, [processedUsersWithMessages]);

  // Update latest messages when real-time messages arrive
  useEffect(() => {
    if (realtimeMessages.length > 0) {
      const latestMessage = realtimeMessages[realtimeMessages.length - 1];

      // Only update if we have a valid message and sender
      if (latestMessage && latestMessage.senderId && latestMessage.content) {
        // Update the UI immediately for better UX
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

        // Refresh conversations data in the background to keep it in sync
        // This will only refetch the first page to avoid disrupting infinite scroll
        handleRefetch();
      }
    }
  }, [realtimeMessages, agent.id, fetchCurrentConversationMessages, refetchConversations]);

  // Handle loading more data with infinite loading
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Send message from admin
  const handleSendMessage = useCallback(
    (content: string) => {
      sendAdminMessage(content, () => {
        handleRefetch();
      });
    },
    [sendAdminMessage]
  );

  const handleRefetch = async () => {
    await Promise.all([refetchConversations(), fetchCurrentConversationMessages(false)]);
  };

  return (
    <div className="flex w-full overflow-hidden h-[calc(100vh-125px)]">
      {agentUserStatus === 'loading' ? (
        <div className="flex w-full items-center justify-center h-full">
          <AnimatedLoadingSmall />
        </div>
      ) : agentUsers.length > 0 && selectedAgentUser ? (
        <React.Fragment>
          <UsersConversationSidebar
            users={usersWithLatestMessage}
            selectedUser={selectedAgentUser}
            onSelectUser={setSelectedAgentUser}
            onLoadMore={handleLoadMore}
            isLoadingMore={isFetchingNextPage}
            hasMore={hasNextPage}
          />
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <AppUserAvatarWithStatus
                  size={35}
                  walletAddress={selectedAgentUser.wallet_address! as `0x${string}`}
                  name={selectedAgentUser.name}
                  userId={selectedAgentUser.id}
                />
                <div>
                  <p className="font-medium text-sm">
                    {
                      <Identity
                        address={selectedAgentUser.wallet_address! as `0x${string}`}
                        showAddress={false}
                        showAvatar={false}
                        nameClassName="text-xs font-medium"
                        truncateLength={{ startLength: 6, endLength: 4 }}
                      />
                    }
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
                selectedUser={selectedAgentUser}
                onSendMessage={handleSendMessage}
                onMarkAsRead={markAsRead}
                isConnected={isConnected}
                typingUsers={typingUsers}
              />
            </div>
          </div>
          {/* User Details Drawer */}
          <ResizableSheet className="w-full" side="right" open={open} onOpenChange={setOpen}>
            {selectedAgentUser && <UserDetails userId={selectedAgentUser.id} />}
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
