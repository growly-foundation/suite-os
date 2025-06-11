import { formatDate, formatNumber } from '@/lib/string.utils';
import { MoreHorizontal } from 'lucide-react';

import { ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { ActivityIcon } from '../transactions/activity-icon';
import { Button } from '../ui/button';
import { TableCell, TableRow } from '../ui/table';
import { AppUserAvatarWithStatus } from './app-user-avatar-with-status';

export const UserTableItem = ({
  user,
  handleUserClick,
}: {
  user: ParsedUser;
  handleUserClick: (user: ParsedUser) => void;
}) => {
  const lastActivity = user.recentActivity[0];
  const totalPortfolioValue = user.tokens.reduce((acc, token) => acc + token.value, 0);
  return (
    <TableRow
      key={user.id}
      className="cursor-pointer hover:bg-slate-50"
      onClick={() => handleUserClick(user)}>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-3">
          <AppUserAvatarWithStatus user={user} size={30} />
          <div className="flex flex-col">
            <WalletAddress
              truncate
              truncateLength={{ startLength: 12, endLength: 4 }}
              address={user.address}
            />
            <span className="text-xs text-muted-foreground">{user.company}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium">${formatNumber(totalPortfolioValue)}</span>
      </TableCell>
      <TableCell>
        {lastActivity ? (
          <div className="flex items-center gap-2">
            <ActivityIcon type={lastActivity.type} />
            <div className="flex flex-col">
              <span className="text-sm line-clamp-1">{lastActivity.description}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(lastActivity.timestamp)}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No activity</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.reputation.level}</span>
          <span className="text-xs text-muted-foreground">
            {formatNumber(user.reputation.score)} points
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {user.tokens.slice(0, 2).map((token, i) => (
            <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">
              {token.symbol}
            </span>
          ))}
          {user.tokens.length > 2 && (
            <div className="text-xs bg-slate-100 px-2 py-1 rounded">+{user.tokens.length - 2}</div>
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
};
