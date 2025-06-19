import { consumePersona } from '@/core/persona';
import { getBadgeColor } from '@/lib/color.utils';
import { formatNumber } from '@/lib/string.utils';
import { BadgeIcon, MoreHorizontal } from 'lucide-react';
import { formatUnits } from 'viem';

import { ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { ActivityIcon, TxActivityType } from '../transactions/activity-icon';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { TableCell, TableRow } from '../ui/table';
import { AppUserAvatarWithStatus } from './app-user-avatar-with-status';

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
                ? `Sent ${parseFloat(formatUnits(BigInt(lastActivity.value.toString()), parseInt(lastActivity.tokenDecimal || '18'))).toFixed(2)} ${lastActivity.symbol}`
                : `Received ${parseFloat(formatUnits(BigInt(lastActivity.value.toString()), parseInt(lastActivity.tokenDecimal || '18'))).toFixed(2)} ${lastActivity.symbol}`}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No activity</span>
        )}
      </TableCell>
      <TableCell>
        <Badge
          className={getBadgeColor(
            user.onchainData.identities.dominantTrait?.toString() || 'No dominant trait'
          )}>
          <BadgeIcon className="h-2 w-2 mr-1" /> {user.onchainData.identities.dominantTrait}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 min-w-0 max-w-full overflow-hidden">
          {(() => {
            const allTokens = Object.values(mutlichainTokenPortfolio || {}).flatMap(
              tokenList => tokenList.tokens
            );
            const distinctTokens = allTokens.filter(
              (token, index, self) => index === self.findIndex(t => t.symbol === token.symbol)
            );

            return distinctTokens.slice(0, 3).map((token, i) => (
              <div
                key={i}
                className="flex items-center gap-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded-sm flex-shrink-0 min-w-0">
                {token.logoURI && (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-3 h-3 rounded-full flex-shrink-0"
                  />
                )}
                <span className="truncate text-xs font-medium">{token.symbol}</span>
              </div>
            ));
          })()}
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
