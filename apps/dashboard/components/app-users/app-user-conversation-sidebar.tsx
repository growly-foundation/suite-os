'use client';

import { UserWithLatestMessage } from '@/components/agents/agent-conversations';
import { consumePersona } from '@/core/persona';
import { useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

import { SearchInput } from '../inputs/search-input';
import { AppUserConversationItem } from './app-user-conversation-item';

interface UsersListProps {
  users: UserWithLatestMessage[];
  selectedUser: ParsedUser;
  onSelectUser: (user: ParsedUser) => void;
}

export function UsersConversationSidebar({ users, selectedUser, onSelectUser }: UsersListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user => {
    const nameService = consumePersona(user.user).nameService();
    return (
      nameService?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nameService?.avatar?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-[360px] border-r flex flex-col">
      <SearchInput
        className="p-2 border-b"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search ENS or address"
      />
      <div className="flex-1 overflow-auto">
        {filteredUsers.map(user => {
          return (
            <AppUserConversationItem
              key={user.user.id}
              user={user}
              selectedUser={selectedUser}
              onSelectUser={onSelectUser}
            />
          );
        })}
      </div>
    </div>
  );
}
