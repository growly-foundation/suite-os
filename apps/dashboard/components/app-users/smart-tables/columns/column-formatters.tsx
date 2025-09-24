'use client';

import { Badge } from '@/components/ui/badge';
import { consumePersona } from '@/core/persona';
import { getBadgeColor } from '@/lib/color.utils';
import { formatAssetValue } from '@/lib/number.utils';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import moment from 'moment';
import { Address } from 'viem';

import { ImportPrivyUserOutput, ImportUserOutput, ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { useWalletData } from '../../../../hooks/use-wallet-data';
import { Identity } from '../../../identity';
import { ActivityPreview } from '../../../user/activity-preview';
import { TokenPositionsCell } from './token-cell';

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

// Shared cell components that use the wallet data hook
function PortfolioValueCell({ user }: { user: ParsedUser }) {
  const { fungibleTotalUsd, fungibleLoading, fungibleError } = useWalletData(user);

  if (fungibleLoading) {
    return (
      <div className="h-2.5 w-2.5 p-0">
        <Loader2 className="h-2 w-2 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (fungibleError) {
    return <span className="text-xs text-destructive">—</span>;
  }

  return <span className="text-xs">${formatAssetValue(fungibleTotalUsd)}</span>;
}

function TransactionCountCell({ user }: { user: ParsedUser }) {
  const { transactionCount, transactionsLoading, transactionsError } = useWalletData(user);

  if (transactionsLoading) {
    return (
      <div className="h-2.5 w-2.5 p-0">
        <Loader2 className="h-2 w-2 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (transactionsError) {
    return <span className="text-xs text-destructive">—</span>;
  }

  return <span className="text-xs">{formatAssetValue(transactionCount)}</span>;
}

function ActivityCell({ user }: { user: ParsedUser }) {
  const { latestActivity, activityLoading, activityError } = useWalletData(user);
  console.log(latestActivity);

  if (activityLoading) {
    return (
      <div className="h-2.5 w-2.5 p-0">
        <Loader2 className="h-2 w-2 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activityError || !latestActivity) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const lastActivity = {
    from: latestActivity.from,
    to: latestActivity.to,
    value: latestActivity.value,
    symbol: latestActivity.symbol,
    tokenDecimal: latestActivity.tokenDecimal,
    timestamp: latestActivity.timestamp,
  };

  return (
    <div className="flex items-center gap-2">
      <ActivityPreview activity={lastActivity} userId={user.id} />
    </div>
  );
}

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
      let hasCheckmark = false;

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
        }
        hasCheckmark = persona.getHumanCheckmark();
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
        <Identity
          address={walletAddress as Address}
          name={name}
          avatar={avatar}
          showAddress={false}
          hasCheckmark={hasCheckmark}
          avatarSize={20}
          withStatus={false}
          spacing="normal"
          nameClassName="font-bold text-xs"
          addressClassName="hover:underline"
          truncateLength={{ startLength: 12, endLength: 4 }}
        />
      );
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

    // Wallet address column
    address: (user: T) => {
      let walletAddress = '';
      if (accessor.isType(user, 'parsed')) {
        walletAddress = (user as ParsedUser).entities.walletAddress || '';
      } else if (accessor.hasProperty(user, 'walletAddress')) {
        walletAddress = accessor.getValue(user, 'walletAddress') || '';
      } else if (accessor.hasProperty(user, 'id')) {
        walletAddress = accessor.getValue(user, 'id') || '';
      }
      return <WalletAddress address={walletAddress as Address} className="text-xs" />;
    },

    // Portfolio value (uses shared component)
    portfolioValue: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
        return <PortfolioValueCell user={user as ParsedUser} />;
      }
      return null;
    },

    // Transactions count (uses shared component)
    transactions: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
        return <TransactionCountCell user={user as ParsedUser} />;
      }
      return null;
    },

    // Activity preview (uses shared component)
    activity: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
        return <ActivityCell user={user as ParsedUser} />;
      }
      return null;
    },

    // Tokens - generic cell using shared wallet data
    tokens: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
        return <TokenPositionsCell user={user as ParsedUser} />;
      }
      return null;
    },

    // Wallet active at (first funding tx across chains)
    walletActiveAt: (user: T) => {
      if (!accessor.isType(user, 'parsed')) return <span className="text-xs">-</span>;
      const parsed = user as ParsedUser;
      // Use the real wallet address from entities; persona.address() may be a UUID
      const walletAddress = parsed.entities.walletAddress || '';
      const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/.test(walletAddress);
      const chainIds = [1, 8453];

      if (!isValidEthAddress) {
        return <span className="text-xs">-</span>;
      }

      // Lazy import to avoid circulars at module init
      const { trpc } = require('@/trpc/client');
      const { data, isLoading, error } = trpc.etherscan.getAddressFundedByAcrossChains.useQuery(
        { address: walletAddress, chainIds },
        { enabled: isValidEthAddress }
      );

      if (isLoading)
        return (
          <div className="h-2.5 w-2.5 p-0">
            <Loader2 className="h-2 w-2 animate-spin text-muted-foreground" />
          </div>
        );
      if (error || !data) return <span className="text-xs">-</span>;

      const timestamps = Object.values(data)
        .filter(Boolean)
        .map((info: any) => parseInt(info.timeStamp, 10) * 1000)
        .filter((n: number) => Number.isFinite(n) && n > 0);
      const minTs = timestamps.length ? Math.min(...timestamps) : 0;

      return <span className="text-xs">{minTs ? moment(minTs).fromNow() : '—'}</span>;
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
