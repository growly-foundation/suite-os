'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { User } from '@/lib/types/users';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface UsersListProps {
  users: User[];
  selectedUser: User;
  onSelectUser: (user: User) => void;
}

export function UsersList({ users, selectedUser, onSelectUser }: UsersListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(
    user =>
      user.ensName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="w-[320px] border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">admin.eth</p>
            <p className="text-xs text-muted-foreground">Web3 Support Agent</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ENS or address"
            className="pl-8 text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 ${selectedUser.id === user.id ? 'bg-slate-50' : ''}`}
            onClick={() => onSelectUser(user)}>
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.ensName} />
                <AvatarFallback>{user.ensName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {user.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium text-sm truncate">{user.ensName}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {user.lastMessageTime}
                </p>
              </div>
              <p className="text-xs text-muted-foreground truncate mb-1">
                {truncateAddress(user.address)}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.status}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  {user.reputation.level}
                </span>
                <span className="text-xs text-muted-foreground">{user.stats.nftCount} NFTs</span>
              </div>
            </div>
            {user.unread && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
