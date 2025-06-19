import { consumePersona } from '@/core/persona';
import { formatNumber } from '@/lib/string.utils';
import { MoreHorizontal } from 'lucide-react';

import { iterateObject } from '@getgrowly/chainsmith/utils';
import { ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { ActivityIcon, TxActivityType } from '../transactions/activity-icon';
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
  const lastActivity = consumePersona(user).getLatestActivity();
  const totalPortfolioValue = user.onchainData?.portfolio_snapshots?.totalValue || 0;
  const mutlichainTokenPortfolio =
    user.onchainData.portfolio_snapshots.tokenPortfolio?.chainRecordsWithTokens;
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
          <div>
            <h3 className="font-bold">{consumePersona(user).nameService()?.name}</h3>
            <WalletAddress
              className="text-xs hover:underline"
              truncate
              truncateLength={{ startLength: 12, endLength: 4 }}
              address={user.onchainData.id}
              onClick={e => {
                e.stopPropagation();
                handleUserClick(user);
              }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-xs">${formatNumber(totalPortfolioValue)}</span>
      </TableCell>
      <TableCell>
        {lastActivity ? (
          <div className="flex items-center gap-2">
            <ActivityIcon
              type={lastActivity.from === user.id ? TxActivityType.Send : TxActivityType.Receive}
            />
            <span className="text-sm line-clamp-1">
              {lastActivity.from === user.id
                ? `Sent ${lastActivity.value} to ${lastActivity.to}`
                : `Received ${lastActivity.value} from ${lastActivity.from}`}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No activity</span>
        )}
      </TableCell>
      <TableCell>
        <UserBadges
          badges={
            user.onchainData.identities.traitScores?.map(traitScore =>
              traitScore.trait.toString()
            ) || []
          }
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {iterateObject(mutlichainTokenPortfolio || {}, (chainName, tokenList) => (
            <span key={chainName} className="text-xs bg-slate-100 px-2 py-1 rounded">
              {tokenList.tokens.slice(0, 2).map((token, i) => (
                <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {token.symbol}
                </span>
              ))}
            </span>
          ))}
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
