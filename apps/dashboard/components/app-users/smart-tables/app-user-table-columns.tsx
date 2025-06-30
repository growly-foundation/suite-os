'use client';

import { TalentProtocolCheckmark } from '@/components/user/talent-protocol-checkmark';
import { consumePersona } from '@/core/persona';
import { getBadgeColor } from '@/lib/color.utils';
import { formatNumber } from '@/lib/string.utils';
import { cn } from '@/lib/utils';
import { BadgeIcon, Calendar, CoinsIcon, DollarSign, Layers, UserIcon } from 'lucide-react';
import moment from 'moment';

import { TMarketToken, TTokenTransferActivity } from '@getgrowly/chainsmith/types';
import { ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { AssetIcon } from '../../ui/asset-icon';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { ActivityPreview } from '../../user/activity-preview';
import { AppUserAvatarWithStatus } from '../app-user-avatar-with-status';
import { AdvancedColumnType, ColumnType, SmartTableColumn } from '../types';
import { createChatSessionColumns } from './chat-session-columns';
import { HeadLabelWithIcon } from './table-head-label';

export const getDistinctTokens = (user: ParsedUser) => {
  const mutlichainTokenPortfolio =
    user.onchainData.portfolio_snapshots.tokenPortfolio?.chainRecordsWithTokens;
  const allTokens = Object.values(mutlichainTokenPortfolio || {}).flatMap(
    tokenList => tokenList.tokens
  );
  const distinctTokens = allTokens.filter(
    (token, index, self) => index === self.findIndex(t => t.symbol === token.symbol)
  );
  return distinctTokens;
};

// Create dynamic column definitions
export const createUserTableColumns = ({
  onUserClick,
  onCheckboxChange,
  selectedUsers,
  onSelectAll,
}: {
  onUserClick: (user: ParsedUser) => void;
  onCheckboxChange: (userId: string, checked: boolean) => void;
  selectedUsers: Record<string, boolean>;
  onSelectAll: (checked: boolean) => void;
}): SmartTableColumn<ParsedUser>[] => {
  return [
    {
      key: 'identity',
      sortable: false,
      header: (
        <div className="flex items-center space-x-4 h-12 border-r">
          <Checkbox
            className="border-gray-450"
            checked={Object.values(selectedUsers).some(Boolean)}
            onCheckedChange={onSelectAll}
          />
          <HeadLabelWithIcon
            icon={<UserIcon className="h-3 w-3 text-muted-foreground" />}
            label="User"
          />
        </div>
      ),
      type: ColumnType.OBJECT,
      sticky: true,
      border: false,
      className: 'sticky py-0 left-0 bg-white box-shadow shadow-sm z-10',
      dataExtractor: (user: ParsedUser) => user,
      contentRenderer: (user: ParsedUser) => {
        const userPersona = consumePersona(user);
        const name = userPersona.nameService()?.name || '';
        return (
          <div className="flex items-center space-x-4 h-12 border-r">
            <Checkbox
              className="border-gray-450"
              checked={!!selectedUsers[user.id]}
              onCheckedChange={checked => onCheckboxChange(user.id, !!checked)}
            />
            <div className="flex items-center text-sm space-x-3 pr-4">
              <AppUserAvatarWithStatus user={user} size={25} />
              <div>
                <h3 className="font-bold text-xs">{name}</h3>
                <WalletAddress
                  className="text-xs hover:underline"
                  truncate
                  truncateLength={{ startLength: 12, endLength: 4 }}
                  address={user.onchainData.id}
                  onClick={e => {
                    e.stopPropagation();
                    onUserClick(user);
                  }}
                />
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'talentProtocolCheckMark',
      sortable: false,
      header: <HeadLabelWithIcon label="Verified" />,
      type: ColumnType.BOOLEAN,
      dataExtractor: (user: ParsedUser) => {
        const persona = consumePersona(user);
        return persona.getHumanCheckmark();
      },
      contentRenderer: (extractedData: boolean) => {
        return (
          <div className="flex items-center justify-center">
            <span className="text-xs">
              {extractedData && <TalentProtocolCheckmark width={20} height={20} />}
            </span>
          </div>
        );
      },
    },
    {
      key: 'firstSignedIn',
      sortable: true,
      header: (
        <HeadLabelWithIcon
          icon={<Calendar className="h-3 w-3 text-muted-foreground" />}
          label="First Signed In"
        />
      ),
      type: ColumnType.DATE,
      dataExtractor: (user: ParsedUser) => {
        const date = new Date(user.created_at);
        return date.getTime();
      },
      contentRenderer: (extractedData: number) => {
        return <span className="text-xs">{moment(extractedData).fromNow()}</span>;
      },
    },
    {
      key: 'trait',
      sortable: true,
      header: (
        <HeadLabelWithIcon
          icon={<BadgeIcon className="h-3 w-3 text-muted-foreground" />}
          label="Trait"
        />
      ),
      type: ColumnType.STRING,
      dataExtractor: (user: ParsedUser) => {
        const userPersona = consumePersona(user);
        const dominantTrait = userPersona.dominantTrait();
        return dominantTrait?.toString() || '';
      },
      contentRenderer: (extractedData: string) => (
        <Badge className={cn(getBadgeColor(extractedData), 'rounded-full')}>{extractedData}</Badge>
      ),
    },
    {
      key: 'portfolioValue',
      sortable: true,
      header: (
        <HeadLabelWithIcon
          icon={<DollarSign className="h-3 w-3 text-muted-foreground" />}
          label="Portfolio Value"
        />
      ),
      type: ColumnType.NUMBER,
      dataExtractor: (user: ParsedUser) => {
        const totalPortfolioValue = user.onchainData?.portfolio_snapshots?.totalValue || 0;
        return totalPortfolioValue;
      },
      contentRenderer: (extractedData: number) => (
        <span className="text-xs">{formatNumber(extractedData)} USD</span>
      ),
    },
    {
      key: 'transactions',
      sortable: true,
      header: (
        <HeadLabelWithIcon
          icon={<Layers className="h-3 w-3 text-muted-foreground" />}
          label="Transactions"
        />
      ),
      type: ColumnType.NUMBER,
      dataExtractor: (user: ParsedUser) => {
        const userPersona = consumePersona(user);
        const txCount = userPersona.universalTransactions().length;
        return txCount;
      },
      contentRenderer: (extractedData: number) => <span className="text-xs">{extractedData}</span>,
    },
    {
      key: 'tokens',
      sortable: true,
      header: (
        <HeadLabelWithIcon
          icon={<CoinsIcon className="h-3 w-3 text-muted-foreground" />}
          label="Tokens"
        />
      ),
      type: ColumnType.ARRAY,
      dataExtractor: (user: ParsedUser) => {
        const distinctTokens = getDistinctTokens(user);
        return distinctTokens;
      },
      sortingValueGetter: (user: ParsedUser) => {
        const distinctTokens = getDistinctTokens(user);
        return distinctTokens.length;
      },
      contentRenderer: (extractedData: TMarketToken[]) => {
        const style =
          'flex items-center gap-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded-sm flex-shrink-0 min-w-0';
        return (
          <div className="flex items-center gap-1 min-w-0 max-w-full overflow-hidden">
            {extractedData.slice(0, 3).map((token, i) => (
              <div key={i} className={style}>
                <AssetIcon
                  logoURI={token.logoURI}
                  symbol={token.symbol}
                  size="sm"
                  className="flex-shrink-0"
                />
                <span className="truncate text-xs font-medium">{token.symbol}</span>
              </div>
            ))}
            {extractedData.length > 3 && (
              <div className={style}>
                <span className="truncate text-xs font-medium">+{extractedData.length - 3}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'activity',
      sortable: true,
      header: 'Activity',
      type: ColumnType.OBJECT,
      dataExtractor: (user: ParsedUser) => {
        const userPersona = consumePersona(user);
        const lastActivity = userPersona.getLatestActivity();
        return {
          lastActivity,
          user,
        };
      },
      sortingValueGetter: (user: ParsedUser): number => {
        const userPersona = consumePersona(user);
        const lastActivity = userPersona.getLatestActivity();
        return lastActivity ? Number(lastActivity.timestamp) : 0;
      },
      contentRenderer: (extractedData: {
        lastActivity: TTokenTransferActivity;
        user: ParsedUser;
      }) => {
        return (
          extractedData.lastActivity && (
            <div className="flex items-center gap-2">
              <ActivityPreview
                activity={extractedData.lastActivity}
                userId={extractedData.user.id}
                variant="compact"
              />
            </div>
          )
        );
      },
      aggregate: ({ lastActivity }: { lastActivity: TTokenTransferActivity }) => lastActivity,
    },
    {
      key: 'walletCreatedAt',
      sortable: true,
      header: (
        <HeadLabelWithIcon
          icon={<Calendar className="h-3 w-3 text-muted-foreground" />}
          label="Wallet Created At"
        />
      ),
      type: ColumnType.DATE,
      dataExtractor: (user: ParsedUser) => {
        const persona = consumePersona(user);
        const date = persona.walletCreatedAt();
        return date ? date.getTime() : 0;
      },
      contentRenderer: (extractedData: number) => {
        return <span className="text-xs">{moment(extractedData).format('DD/MM/YYYY HH:mm')}</span>;
      },
    },
    {
      type: AdvancedColumnType.BATCH,
      batchRenderer: createChatSessionColumns,
    },
  ];
};
