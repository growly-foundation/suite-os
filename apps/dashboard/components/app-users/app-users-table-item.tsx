import { consumePersona } from '@/core/persona';
import { getBadgeColor } from '@/lib/color.utils';
import { formatNumber } from '@/lib/string.utils';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

import { ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { AssetIcon } from '../ui/asset-icon';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { TableCell, TableRow } from '../ui/table';
import { ActivityPreview } from '../user/activity-preview';
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
  const userPersona = consumePersona(user);
  const dominantTrait = userPersona.dominantTrait();
  const lastActivity = userPersona.getLatestActivity();
  const totalPortfolioValue = user.onchainData?.portfolio_snapshots?.totalValue || 0;
  const mutlichainTokenPortfolio =
    user.onchainData.portfolio_snapshots.tokenPortfolio?.chainRecordsWithTokens;
  return (
    <TableRow
      key={user.id}
      className="cursor-pointer hover:bg-slate-50"
      onClick={() => onCheckedChange(!selected)}>
      <TableCell border={false}>
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
            <h3 className="font-bold text-xs">{userPersona.nameService()?.name}</h3>
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
        <span className="text-xs">{userPersona.universalTransactions().length}</span>
      </TableCell>
      <TableCell>
        {lastActivity ? (
          <div className="flex items-center gap-2">
            <ActivityPreview activity={lastActivity} userId={user.id} variant="compact" />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unknown</span>
        )}
      </TableCell>
      <TableCell>
        {dominantTrait ? (
          <Badge
            className={cn(
              getBadgeColor(dominantTrait?.toString() || 'No dominant trait'),
              'rounded-full'
            )}>
            {dominantTrait?.toString()}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">Unknown</span>
        )}
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
                <AssetIcon
                  logoURI={token.logoURI}
                  symbol={token.symbol}
                  size="sm"
                  className="flex-shrink-0"
                />
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
