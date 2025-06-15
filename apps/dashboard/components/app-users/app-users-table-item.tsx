import { formatNumber } from '@/lib/string.utils';
import { MoreHorizontal } from 'lucide-react';

import { ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { ActivityIcon } from '../transactions/activity-icon';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { TableCell, TableRow } from '../ui/table';
import { AppUserAvatarWithStatus } from './app-user-avatar-with-status';
import { UserBadges } from './app-user-badges';

export const UserTableItem = ({
  user,
  handleUserClick,
  selected,
  onCheckedChange,
}: {
  user: ParsedUser;
  handleUserClick: (user: ParsedUser) => void;
  selected: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  const lastActivity = user.recentActivity[0];
  const totalPortfolioValue = user.tokens.reduce((acc, token) => acc + token.value, 0);
  return (
    <TableRow
      key={user.id}
      className="cursor-pointer hover:bg-slate-50"
      onClick={() => onCheckedChange(!selected)}>
      <TableCell>
        <Checkbox
          className="border-gray-450"
          checked={selected}
          onCheckedChange={onCheckedChange}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center text-sm space-x-3">
          <AppUserAvatarWithStatus user={user} size={30} />
          <WalletAddress
            className="text-xs hover:underline"
            truncate
            truncateLength={{ startLength: 12, endLength: 4 }}
            address={user.address}
            onClick={e => {
              e.stopPropagation();
              handleUserClick(user);
            }}
          />
        </div>
      </TableCell>
      <TableCell>
        <span className="text-xs">${formatNumber(totalPortfolioValue)}</span>
      </TableCell>
      <TableCell>
        {lastActivity ? (
          <div className="flex items-center gap-2">
            <ActivityIcon type={lastActivity.type} />
            <span className="text-sm line-clamp-1">{lastActivity.description}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No activity</span>
        )}
      </TableCell>
      <TableCell>
        <UserBadges badges={user.reputation.badges} />
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
