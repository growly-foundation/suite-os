'use client';

import moment from 'moment';
import { Address } from 'viem';

import { ImportPrivyUserOutput, ImportUserOutput, ParsedUser } from '@getgrowly/core';
import { WalletAddress } from '@getgrowly/ui';

import { Identity } from '../../../identity';
import {
  ActivityCell,
  PortfolioValueCell,
  TraitBadgeCell,
  TransactionCountCell,
  WalletFundedAtCell,
} from './column-cell-renderer';
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
        walletAddress = parsedUser.wallet_address! as `0x${string}`;
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
          hasCheckmark={false}
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
        return <TraitBadgeCell user={user as ParsedUser} />;
      }
      return null;
    },

    // Wallet address column
    address: (user: T) => {
      let walletAddress = '';
      if (accessor.isType(user, 'parsed')) {
        walletAddress = (user as ParsedUser).wallet_address! as `0x${string}`;
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
    walletFundedAt: (user: T) => {
      if (accessor.isType(user, 'parsed')) {
        return <WalletFundedAtCell user={user as ParsedUser} />;
      }
      return null;
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
