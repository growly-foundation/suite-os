'use client';

import { ParsedUser } from '@getgrowly/core';

import { UserWithLatestMessage } from '../agents/agent-conversations';
import { AppUserConversationItem } from './app-user-conversation-item';

export function UsersConversationSidebar({
  users,
  selectedUser,
  onSelectUser,
  onLoadMore,
  isLoadingMore,
  hasMore,
}: {
  users: UserWithLatestMessage[];
  selectedUser: ParsedUser;
  onSelectUser: (user: ParsedUser) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}) {
  return (
    <div
      className="w-[400px] border-r flex-shrink-0 overflow-y-auto"
      onScroll={event => {
        if (!onLoadMore || !hasMore || isLoadingMore) return;

        const target = event.currentTarget;
        const { scrollTop, scrollHeight, clientHeight } = target;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom) {
          onLoadMore();
        }
      }}>
      <div className="space-y-2 p-4">
        {users.map(({ user, latestMessageDate, latestMessageContent, latestMessageSender }) => {
          return (
            <AppUserConversationItem
              key={user.id}
              user={{ user, latestMessageDate, latestMessageContent, latestMessageSender }}
              selectedUser={selectedUser}
              onSelectUser={onSelectUser}
            />
          );
        })}
        {hasMore && (
          <div className="py-4 flex justify-center">
            <button className="text-sm text-muted-foreground" onClick={onLoadMore}>
              Load more
            </button>
          </div>
        )}
        {isLoadingMore && (
          <div className="py-4 flex justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
