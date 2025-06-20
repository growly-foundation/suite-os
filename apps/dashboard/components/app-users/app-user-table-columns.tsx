'use client';

import { consumePersona } from '@/core/persona';
import { suiteCore } from '@/core/suite';
import { getBadgeColor } from '@/lib/color.utils';
import { formatNumber } from '@/lib/string.utils';
import { cn } from '@/lib/utils';
import { BadgeIcon, Calendar, CoinsIcon, DollarSign, Layers, UserIcon } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';

import { Agent, Message, ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { AssetIcon } from '../ui/asset-icon';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { IconContainer } from '../ui/icon-container';
import { Loadable } from '../ui/loadable';
import { ActivityPreview } from '../user/activity-preview';
import { AppUserAvatarWithStatus } from './app-user-avatar-with-status';
import { SmartTableColumn, TableColumn } from './types';

// Helper component for column headers with icons
export const HeadLabelWithIcon = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center space-x-2 text-xs">
    <IconContainer>{icon}</IconContainer>
    <span>{label}</span>
  </div>
);

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
      type: 'component',
      sticky: true,
      border: false,
      className: 'sticky py-0 left-0 bg-white z-10',
      contentRenderer: (user: ParsedUser) => {
        const userPersona = consumePersona(user);
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
                <h3 className="font-bold text-xs">{userPersona.nameService()?.name}</h3>
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
      type: 'batch',
      batchRenderer: createChatSessionColumns,
    },
    {
      key: 'portfolioValue',
      header: (
        <HeadLabelWithIcon
          icon={<DollarSign className="h-3 w-3 text-muted-foreground" />}
          label="Portfolio Value"
        />
      ),
      type: 'number',
      contentRenderer: (user: ParsedUser) => {
        const totalPortfolioValue = user.onchainData?.portfolio_snapshots?.totalValue || 0;
        return <span className="text-xs">${formatNumber(totalPortfolioValue)}</span>;
      },
    },
    {
      key: 'createdAt',
      header: (
        <HeadLabelWithIcon
          icon={<Calendar className="h-3 w-3 text-muted-foreground" />}
          label="Created At"
        />
      ),
      type: 'date',
      contentRenderer: (user: ParsedUser) => {
        return <span className="text-xs">{moment(user.created_at).fromNow()}</span>;
      },
    },
    {
      key: 'transactions',
      header: (
        <HeadLabelWithIcon
          icon={<Layers className="h-3 w-3 text-muted-foreground" />}
          label="Transactions"
        />
      ),
      type: 'number',
      contentRenderer: (user: ParsedUser) => {
        const userPersona = consumePersona(user);
        return <span className="text-xs">{userPersona.universalTransactions().length}</span>;
      },
    },
    {
      key: 'activity',
      header: 'Activity',
      type: 'component',
      contentRenderer: (user: ParsedUser) => {
        const userPersona = consumePersona(user);
        const lastActivity = userPersona.getLatestActivity();
        return (
          lastActivity && (
            <div className="flex items-center gap-2">
              <ActivityPreview activity={lastActivity} userId={user.id} variant="compact" />
            </div>
          )
        );
      },
    },
    {
      key: 'trait',
      header: (
        <HeadLabelWithIcon
          icon={<BadgeIcon className="h-3 w-3 text-muted-foreground" />}
          label="Trait"
        />
      ),
      type: 'component',
      contentRenderer: (user: ParsedUser) => {
        const userPersona = consumePersona(user);
        const dominantTrait = userPersona.dominantTrait();
        return (
          dominantTrait && (
            <Badge
              className={cn(
                getBadgeColor(dominantTrait?.toString() || 'No dominant trait'),
                'rounded-full'
              )}>
              {dominantTrait?.toString()}
            </Badge>
          )
        );
      },
    },
    {
      key: 'tokens',
      header: (
        <HeadLabelWithIcon
          icon={<CoinsIcon className="h-3 w-3 text-muted-foreground" />}
          label="Tokens"
        />
      ),
      type: 'array',
      contentRenderer: (user: ParsedUser) => {
        const mutlichainTokenPortfolio =
          user.onchainData.portfolio_snapshots.tokenPortfolio?.chainRecordsWithTokens;
        return (
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
        );
      },
    },
  ];
};

export const createChatSessionColumns = (user?: ParsedUser): TableColumn<ParsedUser>[] => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [lastestAgent, setLastestAgent] = useState<Agent | null>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchLatestMessage = async () => {
      if (!user) return;
      setLoading(true);

      const lastConversation = user.chatSession?.lastConversation;
      if (!lastConversation?.messageId) return setLoading(false);

      const message = await suiteCore.db.messages.getById(lastConversation.messageId);
      if (!message) return setLoading(false);

      const agent = await suiteCore.db.agents.getById(lastConversation.agentId);
      if (!agent) return setLoading(false);

      setLatestMessage(message);
      setLastestAgent(agent);
      setLoading(false);
    };
    fetchLatestMessage();
  }, [!!user]);
  return [
    {
      key: 'latestMessageAt',
      header: (
        <HeadLabelWithIcon
          icon={<Calendar className="h-3 w-3 text-muted-foreground" />}
          label="Latest Message At"
        />
      ),
      type: 'date',
      contentRenderer: () => {
        return (
          <Loadable loading={loading}>
            {latestMessage && (
              <span className="text-xs">{moment(latestMessage.created_at).fromNow()}</span>
            )}
          </Loadable>
        );
      },
    },
    {
      key: 'latestInteractedAgent',
      header: (
        <HeadLabelWithIcon
          icon={<Calendar className="h-3 w-3 text-muted-foreground" />}
          label="Latest Interacted Agent"
        />
      ),
      type: 'string',
      contentRenderer: () => {
        return (
          <Loadable loading={loading}>
            {lastestAgent && <span className="text-xs">{lastestAgent.name}</span>}
          </Loadable>
        );
      },
    },
  ];
};
