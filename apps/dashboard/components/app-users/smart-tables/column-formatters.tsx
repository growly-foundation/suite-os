'use client';

import { Badge } from '@/components/ui/badge';
import { TalentProtocolCheckmark } from '@/components/user/talent-protocol-checkmark';
import { consumePersona } from '@/core/persona';
import { getBadgeColor } from '@/lib/color.utils';
import { formatNumber } from '@/lib/string.utils';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { Address } from 'viem';

import { ImportPrivyUserOutput, ImportUserOutput, ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { AssetIcon } from '../../ui/asset-icon';
import { ActivityPreview } from '../../user/activity-preview';

// Type for any user data that can be displayed in the table
export type TableUserData = ParsedUser | ImportUserOutput | ImportPrivyUserOutput;

// Column formatters for different data types
export const columnFormatters = {
  // Identity column (wallet address, avatar, name)
  identity: (user: TableUserData) => {
    const walletAddress =
      'walletAddress' in user ? user.walletAddress || '' : 'id' in user ? user.id : '';
    const name = 'name' in user ? user.name : undefined;

    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center text-sm space-x-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">
              {name ? name.charAt(0).toUpperCase() : walletAddress.slice(2, 4)}
            </span>
          </div>
          <div>
            {name && <h3 className="font-bold text-xs">{name}</h3>}
            <WalletAddress
              className="text-xs hover:underline"
              truncate
              truncateLength={{ startLength: 12, endLength: 4 }}
              address={walletAddress as Address}
            />
          </div>
        </div>
      </div>
    );
  },

  // Talent Protocol checkmark
  talentProtocolCheckmark: (user: TableUserData) => {
    if ('personaData' in user) {
      const persona = consumePersona(user as ParsedUser);
      const hasCheckmark = persona.getHumanCheckmark();

      return (
        <div className="flex items-center justify-center">
          <span className="text-xs">
            {hasCheckmark && <TalentProtocolCheckmark width={20} height={20} />}
          </span>
        </div>
      );
    }
    return null;
  },

  // First signed in date
  firstSignedIn: (user: TableUserData) => {
    const date = 'created_at' in user ? new Date(user.created_at) : new Date();
    return <span className="text-xs">{moment(date).fromNow()}</span>;
  },

  // Trait (dominant trait for ParsedUser)
  trait: (user: TableUserData) => {
    if ('personaData' in user) {
      const userPersona = consumePersona(user as ParsedUser);
      const dominantTrait = userPersona.dominantTrait()?.toString() || '';

      return (
        <Badge className={cn(getBadgeColor(dominantTrait), 'rounded-full')}>{dominantTrait}</Badge>
      );
    }
    return null;
  },

  // Portfolio value
  portfolioValue: (user: TableUserData) => {
    if ('personaData' in user) {
      const totalPortfolioValue =
        (user as ParsedUser).personaData?.portfolio_snapshots?.totalValue || 0;
      return <span className="text-xs">{formatNumber(totalPortfolioValue)} USD</span>;
    }
    return null;
  },

  // Transaction count
  transactions: (user: TableUserData) => {
    if ('personaData' in user) {
      const userPersona = consumePersona(user as ParsedUser);
      const txCount = userPersona.universalTransactions().length;
      return <span className="text-xs">{txCount}</span>;
    }
    return null;
  },

  // Tokens (distinct tokens for ParsedUser)
  tokens: (user: TableUserData) => {
    if ('personaData' in user) {
      const mutlichainTokenPortfolio = (user as ParsedUser).personaData.portfolio_snapshots
        .tokenPortfolio?.chainRecordsWithTokens;
      const allTokens = Object.values(mutlichainTokenPortfolio || {}).flatMap(
        tokenList => tokenList.tokens
      );
      const distinctTokens = allTokens.filter(
        (token, index, self) => index === self.findIndex(t => t.symbol === token.symbol)
      );

      const style =
        'flex items-center gap-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded-sm flex-shrink-0 min-w-0';

      return (
        <div className="flex items-center gap-1 min-w-0 max-w-full overflow-hidden">
          {distinctTokens.slice(0, 3).map((token, i) => (
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
          {distinctTokens.length > 3 && (
            <div className={style}>
              <span className="truncate text-xs font-medium">+{distinctTokens.length - 3}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  },

  // Activity (latest activity for ParsedUser)
  activity: (user: TableUserData) => {
    if ('personaData' in user) {
      const userPersona = consumePersona(user as ParsedUser);
      const lastActivity = userPersona.getLatestActivity();

      return (
        lastActivity && (
          <div className="flex items-center gap-2">
            <ActivityPreview
              activity={lastActivity}
              userId={(user as ParsedUser).id}
              variant="compact"
            />
          </div>
        )
      );
    }
    return null;
  },

  // Wallet created at
  walletCreatedAt: (user: TableUserData) => {
    if ('personaData' in user) {
      const persona = consumePersona(user as ParsedUser);
      const date = persona.walletCreatedAt();
      return date ? (
        <span className="text-xs">{moment(date).format('DD/MM/YYYY HH:mm')}</span>
      ) : null;
    }
    return null;
  },

  // Email (for ImportPrivyUserOutput and ImportUserOutput)
  email: (user: TableUserData) => {
    const email = 'email' in user ? user.email : undefined;
    return email ? (
      <span className="text-sm">{email}</span>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  },

  // Contract data (for ImportUserOutput with contract data)
  contractData: (user: TableUserData) => {
    if ('extra' in user && user.extra && typeof user.extra === 'object') {
      const extra = user.extra as Record<string, any>;
      const interactionCount = extra.interactionCount || 0;
      const lastInteraction = extra.lastInteraction;
      const tokenBalance = extra.tokenBalance;

      return (
        <div className="space-y-1">
          {interactionCount > 0 && (
            <div className="text-xs">
              <span className="text-muted-foreground">Interactions:</span> {interactionCount}
            </div>
          )}
          {lastInteraction && (
            <div className="text-xs">
              <span className="text-muted-foreground">Last:</span>{' '}
              {new Date(lastInteraction).toLocaleDateString()}
            </div>
          )}
          {tokenBalance && (
            <div className="text-xs">
              <span className="text-muted-foreground">Balance:</span> {tokenBalance}
            </div>
          )}
        </div>
      );
    }
    return <span className="text-muted-foreground">No data</span>;
  },

  // Source (for imported users)
  source: (user: TableUserData) => {
    const source = 'source' in user ? user.source : undefined;
    if (source) {
      return (
        <Badge variant="secondary" className="text-xs">
          {source}
        </Badge>
      );
    }
    return null;
  },
};

// Helper function to get formatter based on column key
export function getFormatter(key: string) {
  return columnFormatters[key as keyof typeof columnFormatters] || (() => null);
}

// Helper function to check if a user has specific data
export function hasData(user: TableUserData, dataType: string): boolean {
  switch (dataType) {
    case 'personaData':
      return 'personaData' in user;
    case 'email':
      return 'email' in user;
    case 'extra':
      return 'extra' in user && !!user.extra;
    case 'source':
      return 'source' in user;
    default:
      return false;
  }
}
