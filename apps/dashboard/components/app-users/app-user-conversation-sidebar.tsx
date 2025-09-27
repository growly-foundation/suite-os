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
      className="w-[400px] border-r flex-shrink-0 overflow-y-auto scrollbar-hidden h-full"
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
        {hasMore && !isLoadingMore && (
          <div className="py-4 flex justify-center">
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-md hover:bg-muted"
              onClick={onLoadMore}>
              Load more conversations
            </button>
          </div>
        )}
        {isLoadingMore && (
          <div className="py-4 flex justify-center items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            <span className="text-sm text-muted-foreground">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
}
