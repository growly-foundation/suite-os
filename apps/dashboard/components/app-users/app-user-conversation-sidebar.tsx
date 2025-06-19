'use client';

import { consumePersona } from '@/core/persona';
import moment from 'moment';
import { useState } from 'react';

import { ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { SearchInput } from '../inputs/search-input';
import { AppUserAvatarWithStatus } from './app-user-avatar-with-status';

interface UsersListProps {
  users: ParsedUser[];
  selectedUser: ParsedUser;
  onSelectUser: (user: ParsedUser) => void;
}

export function UsersConversationSidebar({ users, selectedUser, onSelectUser }: UsersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const persona = consumePersona(selectedUser);

  const filteredUsers = users.filter(user => {
    const nameService = consumePersona(user).nameService();
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
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className={`flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-slate-50 ${selectedUser.id === user.id ? 'bg-slate-50' : ''}`}
            onClick={() => onSelectUser(user)}>
            <AppUserAvatarWithStatus user={user} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium text-sm truncate">
                  {consumePersona(user).nameService()?.name || 'No name'}
                </p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {moment(persona.getLatestActivity()?.timestamp).fromNow()}
                </p>
              </div>
              <WalletAddress
                truncate
                truncateLength={{ startLength: 10, endLength: 4 }}
                address={user.onchainData.id}
              />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  {user.onchainData?.identities?.traitScores
                    ?.map(traitScore => traitScore.trait.toString())
                    .join(', ')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.onchainData?.portfolio_snapshots?.nftPortfolio?.totalUsdValue}$ in NFTs
                </span>
              </div>
            </div>
            {/* {user.unread && <div className="h-2 w-2 rounded-full bg-blue-500"></div>} */}
          </div>
        ))}
      </div>
    </div>
  );
}
