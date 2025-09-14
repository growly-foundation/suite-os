'use client';

import { UsersConversationSidebar } from '@/components/app-users/app-user-conversation-sidebar';
import { ConversationArea } from '@/components/conversations/conversation-area';
import { consumePersona } from '@/core/persona';
import { suiteCore } from '@/core/suite';
import { useAgentUsersEffect } from '@/hooks/use-agent-effect';
import { useChatActions } from '@/hooks/use-chat-actions';
import { useDashboardState } from '@/hooks/use-dashboard';
import { Sidebar } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { Address } from 'viem';

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
  const { setSelectedAgentUser } = useDashboardState();
  const [usersWithLatestMessage, setUsersWithLatestMessage] = React.useState<
    UserWithLatestMessage[]
  >([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [totalConversations, setTotalConversations] = React.useState(0);
  const PAGE_SIZE = 10;

  const { selectedUser, users, status } = useAgentUsersEffect(agent.id);
  const [open, setOpen] = React.useState(false);
  const persona = selectedUser ? consumePersona(selectedUser) : null;

  // Chat actions with real-time messaging
  const {
    sendAdminMessage,
    sendAgentResponse,
    markAsRead,
    isConnected,
    typingUsers,
    realtimeMessages,
  } = useChatActions();

  console.log('isConnected', isConnected);
  console.log('typingUsers', typingUsers);
  console.log('realtimeMessages', realtimeMessages);

  const fetchLatestMessages = useCallback(
    async (page: number) => {
      try {
        setIsLoadingMore(true);

        // Get total count on first load
        if (page === 0) {
          const total = await suiteCore.conversations.getConversationsWithMessagesCount(agent.id);
          setTotalConversations(total);
        }

        const conversations = await suiteCore.conversations.getPaginatedLatestConversations(
          agent.id,
          PAGE_SIZE,
          page * PAGE_SIZE
        );

        // Map conversations to users
        const newUsersWithMessages = await Promise.all(
          conversations.map(async (conversation: LatestConversation & { userId: string }) => {
            const user = users.find(u => u.id === conversation.userId);
            if (!user) return null;

            return {
              user,
              latestMessageDate: conversation.message.created_at || null,
              latestMessageSender: conversation.message.sender,
              latestMessageContent: conversation.message.content || null,
            };
          })
        );

        // Filter out null values and update state
        const validUsers = newUsersWithMessages.filter(
          (item: UserWithLatestMessage | null): item is UserWithLatestMessage => item !== null
        );

        if (page === 0) {
          setUsersWithLatestMessage(validUsers as UserWithLatestMessage[]);
        } else {
          setUsersWithLatestMessage(prev => [...prev, ...(validUsers as UserWithLatestMessage[])]);
        }

        // Update hasMore based on total count and current loaded items
        const loadedCount = (page + 1) * PAGE_SIZE;
        setHasMore(loadedCount < totalConversations);
        setIsLoadingMore(false);
      } catch (error) {
        console.error('Error fetching latest messages:', error);
        setIsLoadingMore(false);
        setHasMore(false);
      }
    },
    [agent.id, users, PAGE_SIZE, totalConversations]
  );

  // Load initial data
  useEffect(() => {
    setCurrentPage(0);
    fetchLatestMessages(0);
  }, [users, fetchLatestMessages]);

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
              latestMessageSender: latestMessage.senderId as ConversationRoleKey,
              latestMessageContent: latestMessage.content,
            };
          }
          return userWithMessage;
        })
      );
    }
  }, [realtimeMessages]);

  // Handle loading more data
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchLatestMessages(nextPage);
    }
  }, [currentPage, isLoadingMore, hasMore, fetchLatestMessages]);

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

  // Send agent response (for testing)
  const handleSendAgentResponse = useCallback(
    (content: string) => {
      sendAgentResponse(content);
    },
    [sendAgentResponse]
  );

  return (
    <div className="flex w-full overflow-hidden h-[calc(100vh-100px)]">
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
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
          />
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-3">
                <AppUserAvatarWithStatus
                  size={35}
                  walletAddress={selectedUser.personaData.id as Address}
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
            <ConversationArea
              selectedUser={selectedUser}
              onSendMessage={handleSendMessage}
              onSendAgentResponse={handleSendAgentResponse}
              onMarkAsRead={markAsRead}
              isConnected={isConnected}
              typingUsers={typingUsers}
            />
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
