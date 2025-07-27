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

import { AssetIcon } from '../../../ui/asset-icon';
import { ActivityPreview } from '../../../user/activity-preview';
import { AppUserAvatarWithStatus } from '../../app-user-avatar-with-status';

// Type for any user data that can be displayed in the table
export type TableUserData = ParsedUser | ImportUserOutput | ImportPrivyUserOutput;

// Generic interface for flexible data access
export interface DataAccessor<T = any> {
  getValue: (data: T, key: string) => any;
  hasProperty: (data: T, key: string) => boolean;
  isType: (data: T, type: string) => boolean;
}

// Default data accessor for backward compatibility
export const defaultDataAccessor: DataAccessor<TableUserData> = {
  getValue: (data: TableUserData, key: string) => {
    return (data as any)[key];
  },
  hasProperty: (data: TableUserData, key: string) => {
    return data !== null && data !== undefined && typeof data === 'object' && key in data;
  },
  isType: (data: TableUserData, type: string) => {
    switch (type) {
      case 'parsed':
        return 'personaData' in data;
      case 'privy':
        return 'email' in data && 'walletAddress' in data;
      case 'contract':
        return 'walletAddress' in data && !('email' in data);
      default:
        return false;
    }
  },
};

// Helper function to safely check if an object has a property
export const hasProperty = (obj: any, key: string): boolean => {
  return obj !== null && obj !== undefined && typeof obj === 'object' && key in obj;
};

// Generic column formatters factory
export function createColumnFormatters<T = any>(
  accessor: DataAccessor<T> = defaultDataAccessor as any
) {
  return {
    // Identity column (wallet address, avatar, name)
    identity: (user: T) => {
      let walletAddress = '';
      let name: string | undefined = undefined;
      let avatar: string | undefined = undefined;

      // Handle ParsedUser type
      if (accessor.isType(user, 'parsed')) {
        const parsedUser = user as ParsedUser;
        const persona = consumePersona(parsedUser);
        walletAddress = parsedUser.entities.walletAddress || '';
        // Try to get name from various sources
        const nameService = persona.nameService();
        if (nameService?.name) {
          name = nameService.name;
        }
        if (nameService?.avatar) {
          avatar = nameService.avatar;
        } else if (parsedUser.personaData?.identities?.talentProtocol?.profile?.image_url) {
          avatar = parsedUser.personaData.identities.talentProtocol.profile.image_url;
        }
      } else {
        // Handle other user types (ImportUserOutput, ImportPrivyUserOutput)
        walletAddress = accessor.hasProperty(user, 'walletAddress')
          ? accessor.getValue(user, 'walletAddress') || ''
          : accessor.hasProperty(user, 'id')
            ? accessor.getValue(user, 'id')
            : '';
        name = accessor.hasProperty(user, 'name') ? accessor.getValue(user, 'name') : undefined;
        avatar = accessor.hasProperty(user, 'avatar')
          ? accessor.getValue(user, 'avatar')
          : undefined;
      }

      return (
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-sm space-x-3">
            <AppUserAvatarWithStatus
              size={30}
              walletAddress={walletAddress as Address}
              avatar={avatar}
              name={name}
              withStatus={false}
            />
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
    talentProtocolCheckmark: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
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
    firstSignedIn: (user: T) => {
      const date = accessor.hasProperty(user, 'created_at')
        ? new Date(accessor.getValue(user, 'created_at'))
        : new Date();
      return <span className="text-xs">{moment(date).fromNow()}</span>;
    },

    // Trait (dominant trait for ParsedUser)
    trait: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
        const userPersona = consumePersona(user as ParsedUser);
        const dominantTrait = userPersona.dominantTrait()?.toString() || '';

        return (
          <Badge className={cn(getBadgeColor(dominantTrait), 'rounded-full')}>
            {dominantTrait}
          </Badge>
        );
      }
      return null;
    },

    // Portfolio value
    portfolioValue: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
        const userPersona = consumePersona(user as ParsedUser);
        const totalPortfolioValue = userPersona.totalPortfolioValue() || 0;
        return <span className="text-xs">{formatNumber(totalPortfolioValue)} USD</span>;
      }
      return null;
    },

    // Transaction count
    transactions: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
        const userPersona = consumePersona(user as ParsedUser);
        const txCount = userPersona.universalTransactions().length;
        return <span className="text-xs">{txCount}</span>;
      }
      return null;
    },

    // Tokens (distinct tokens for ParsedUser)
    tokens: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
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
    activity: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
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
    walletCreatedAt: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
        const persona = consumePersona(user as ParsedUser);
        const date = persona.walletCreatedAt();
        return date ? (
          <span className="text-xs">{moment(date).format('DD/MM/YYYY HH:mm')}</span>
        ) : null;
      }
      return null;
    },

    // Email (for ImportPrivyUserOutput and ImportUserOutput)
    email: (user: T) => {
      const email = accessor.hasProperty(user, 'email')
        ? accessor.getValue(user, 'email')
        : undefined;
      return email ? (
        <span className="text-sm">{email}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },

    // Contract data (for ImportUserOutput with contract data)
    contractData: (user: T) => {
      if (
        accessor.hasProperty(user, 'extra') &&
        accessor.getValue(user, 'extra') &&
        typeof accessor.getValue(user, 'extra') === 'object'
      ) {
        const extra = accessor.getValue(user, 'extra') as Record<string, any>;
        const interactionCount = extra.interactionCount || 0;
        const lastInteraction = extra.lastInteraction;
        const tokenBalance = extra.tokenBalance;

        return (
          <div className="space-y-1">
            {interactionCount > 0 && (
              <div className="text-xs">
                <span className="font-medium">{interactionCount}</span> interactions
              </div>
            )}
            {lastInteraction && (
              <div className="text-xs text-muted-foreground">
                Last: {moment(lastInteraction).fromNow()}
              </div>
            )}
            {tokenBalance && <div className="text-xs">Balance: {formatNumber(tokenBalance)}</div>}
          </div>
        );
      }
      return null;
    },

    // Source (for ImportUserOutput and ImportPrivyUserOutput)
    source: (user: T) => {
      const source = accessor.hasProperty(user, 'source')
        ? accessor.getValue(user, 'source')
        : undefined;
      if (!source) return <span className="text-muted-foreground">—</span>;

      return (
        <Badge variant="outline" className="text-xs">
          {source}
        </Badge>
      );
    },

    // Wallet Address (for ImportUserOutput and ImportPrivyUserOutput)
    walletAddress: (user: T) => {
      const walletAddress = accessor.hasProperty(user, 'walletAddress')
        ? accessor.getValue(user, 'walletAddress')
        : undefined;
      if (!walletAddress) return <span className="text-muted-foreground">—</span>;

      return <WalletAddress address={walletAddress as Address} className="text-xs" />;
    },

    // Name (for ImportUserOutput and ImportPrivyUserOutput)
    name: (user: T) => {
      const name = accessor.hasProperty(user, 'name') ? accessor.getValue(user, 'name') : undefined;
      if (!name) return <span className="text-muted-foreground">—</span>;

      return <span className="text-sm font-medium">{name}</span>;
    },

    // Extra data (for ImportUserOutput with extra data like contract interactions)
    extra: (user: T) => {
      if (
        accessor.hasProperty(user, 'extra') &&
        accessor.getValue(user, 'extra') &&
        typeof accessor.getValue(user, 'extra') === 'object'
      ) {
        const extra = accessor.getValue(user, 'extra') as Record<string, any>;
        const transactionCount = extra.transactionCount || 0;
        const firstInteraction = extra.firstInteraction;
        const lastInteraction = extra.lastInteraction;

        return (
          <div className="space-y-1">
            {transactionCount > 0 && (
              <div className="text-xs">
                <span className="font-medium">{transactionCount}</span> interactions
              </div>
            )}
            {firstInteraction && (
              <div className="text-xs text-muted-foreground">
                First: {moment(firstInteraction).fromNow()}
              </div>
            )}
            {lastInteraction && (
              <div className="text-xs text-muted-foreground">
                Last: {moment(lastInteraction).fromNow()}
              </div>
            )}
          </div>
        );
      }
      return <span className="text-muted-foreground">—</span>;
    },

    // Privy-specific formatters
    privyCreatedAt: (user: T) => {
      if (
        accessor.hasProperty(user, 'extra') &&
        accessor.getValue(user, 'extra') &&
        typeof accessor.getValue(user, 'extra') === 'object'
      ) {
        const extra = accessor.getValue(user, 'extra') as Record<string, any>;
        const createdAt = extra.createdAt;
        if (createdAt) {
          return (
            <div className="text-xs">
              <div className="font-medium">{moment(createdAt).format('MMM DD, YYYY')}</div>
              <div className="text-muted-foreground">{moment(createdAt).fromNow()}</div>
            </div>
          );
        }
      }
      return <span className="text-muted-foreground">—</span>;
    },

    privyLinkedAccounts: (user: T) => {
      if (
        accessor.hasProperty(user, 'extra') &&
        accessor.getValue(user, 'extra') &&
        typeof accessor.getValue(user, 'extra') === 'object'
      ) {
        const extra = accessor.getValue(user, 'extra') as Record<string, any>;
        const linkedAccounts = extra.linkedAccounts || [];
        const emailAccounts = linkedAccounts.filter((acc: any) => acc.type === 'email');
        const walletAccounts = linkedAccounts.filter((acc: any) => acc.type === 'wallet');

        return (
          <div className="space-y-1">
            <div className="text-xs">
              <span className="font-medium">{linkedAccounts.length}</span> total
            </div>
            {emailAccounts.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {emailAccounts.length} email{emailAccounts.length > 1 ? 's' : ''}
              </div>
            )}
            {walletAccounts.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {walletAccounts.length} wallet{walletAccounts.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      }
      return <span className="text-muted-foreground">—</span>;
    },

    privyGuestStatus: (user: T) => {
      if (
        accessor.hasProperty(user, 'extra') &&
        accessor.getValue(user, 'extra') &&
        typeof accessor.getValue(user, 'extra') === 'object'
      ) {
        const extra = accessor.getValue(user, 'extra') as Record<string, any>;
        const isGuest = extra.isGuest || false;

        return (
          <Badge variant={isGuest ? 'secondary' : 'default'} className="text-xs">
            {isGuest ? 'Guest' : 'User'}
          </Badge>
        );
      }
      return <span className="text-muted-foreground">—</span>;
    },

    privyLastVerified: (user: T) => {
      if (
        accessor.hasProperty(user, 'extra') &&
        accessor.getValue(user, 'extra') &&
        typeof accessor.getValue(user, 'extra') === 'object'
      ) {
        const extra = accessor.getValue(user, 'extra') as Record<string, any>;
        const emailVerified = extra.email?.latestVerifiedAt;
        const walletVerified = extra.wallet?.latestVerifiedAt;

        let latestVerified = null;
        if (emailVerified && walletVerified) {
          latestVerified = new Date(
            Math.max(new Date(emailVerified).getTime(), new Date(walletVerified).getTime())
          );
        } else if (emailVerified) {
          latestVerified = new Date(emailVerified);
        } else if (walletVerified) {
          latestVerified = new Date(walletVerified);
        }

        if (latestVerified) {
          return (
            <div className="text-xs">
              <div className="font-medium">{moment(latestVerified).format('MMM DD, YYYY')}</div>
              <div className="text-muted-foreground">{moment(latestVerified).fromNow()}</div>
            </div>
          );
        }
      }
      return <span className="text-muted-foreground">—</span>;
    },

    // Contract-specific formatters
    contractTransactions: (user: T) => {
      if (
        accessor.hasProperty(user, 'extra') &&
        accessor.getValue(user, 'extra') &&
        typeof accessor.getValue(user, 'extra') === 'object'
      ) {
        const extra = accessor.getValue(user, 'extra') as Record<string, any>;
        const transactionCount = extra.transactionCount || 0;

        return (
          <div className="text-xs">
            <span className="font-medium">{transactionCount}</span> transactions
          </div>
        );
      }
      return <span className="text-muted-foreground">—</span>;
    },

    contractFirstInteraction: (user: T) => {
      if (
        accessor.hasProperty(user, 'extra') &&
        accessor.getValue(user, 'extra') &&
        typeof accessor.getValue(user, 'extra') === 'object'
      ) {
        const extra = accessor.getValue(user, 'extra') as Record<string, any>;
        const firstInteraction = extra.firstInteraction;
        if (firstInteraction) {
          return (
            <div className="text-xs">
              <div className="font-medium">{moment(firstInteraction).format('MMM DD, YYYY')}</div>
              <div className="text-muted-foreground">{moment(firstInteraction).fromNow()}</div>
            </div>
          );
        }
      }
      return <span className="text-muted-foreground">—</span>;
    },

    contractLastInteraction: (user: T) => {
      if (
        accessor.hasProperty(user, 'extra') &&
        accessor.getValue(user, 'extra') &&
        typeof accessor.getValue(user, 'extra') === 'object'
      ) {
        const extra = accessor.getValue(user, 'extra') as Record<string, any>;
        const lastInteraction = extra.lastInteraction;
        if (lastInteraction) {
          return (
            <div className="text-xs">
              <div className="font-medium">{moment(lastInteraction).format('MMM DD, YYYY')}</div>
              <div className="text-muted-foreground">{moment(lastInteraction).fromNow()}</div>
            </div>
          );
        }
      }
      return <span className="text-muted-foreground">—</span>;
    },
  };
}

// Legacy formatters for backward compatibility
export const columnFormatters = createColumnFormatters<TableUserData>();

// Helper function to get formatter based on column key
export function getFormatter(key: string) {
  return columnFormatters[key as keyof typeof columnFormatters] || (() => null);
}

// Helper function to check if a user has specific data
export function hasData<T extends Record<string, any>>(user: T, dataType: keyof T): boolean {
  return hasProperty(user, dataType as string);
}
