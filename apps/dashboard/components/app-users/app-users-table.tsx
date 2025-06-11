'use client';

import { mockUsers } from '@/constants/mockUsers';
import { cn } from '@/lib/utils';
import { Copy, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { ParsedUser } from '@getgrowly/core';
import { RandomAvatar } from '@getgrowly/ui';

import { Button } from '../ui/button';
import { ResizableSheet } from '../ui/resizable-sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { UserDetails } from './app-user-details';

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function UsersTable() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ParsedUser | null>(null);

  const handleUserClick = (user: ParsedUser) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  const handleCloseUserDetails = () => {
    setOpen(false);
    closeUserDetails();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'send':
        return '↗';
      case 'receive':
        return '↙';
      case 'vote':
        return '🗳';
      default:
        return '↔';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'send':
        return 'bg-red-100 text-red-600';
      case 'receive':
        return 'bg-green-100 text-green-600';
      case 'vote':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-purple-100 text-purple-600';
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">User</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reputation</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.slice(0, 10).map(user => {
              const lastActivity = user.recentActivity[0];
              const isOnline = user.status === 'Online';
              return (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleUserClick(user)}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <RandomAvatar address={user.address} ensAvatar={user.avatar} size={30} />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.ensName || truncateAddress(user.address)}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.company}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono text-sm">{truncateAddress(user.address)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={e => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(user.address);
                        }}>
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy address</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lastActivity ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${getActivityColor(lastActivity.type)}`}>
                          {getActivityIcon(lastActivity.type)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm line-clamp-1">{lastActivity.description}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(lastActivity.timestamp)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No activity</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span
                        className={cn(
                          'mr-2 h-2 w-2 rounded-full',
                          isOnline ? 'bg-green-500' : 'bg-gray-400'
                        )}
                      />
                      <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.reputation.level}</span>
                      <span className="text-xs text-muted-foreground">
                        Score: {user.reputation.score}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {user.topTokens.slice(0, 2).map((token, i) => (
                        <div key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {token.symbol}
                        </div>
                      ))}
                      {user.topTokens.length > 2 && (
                        <div className="text-xs bg-slate-100 px-2 py-1 rounded">
                          +{user.topTokens.length - 2}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={e => {
                        e.stopPropagation();
                        // Handle more options
                      }}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* User Details Drawer */}
      <ResizableSheet side="right" open={open} onOpenChange={handleCloseUserDetails}>
        {selectedUser && <UserDetails user={selectedUser} />}
      </ResizableSheet>
    </>
  );
}
