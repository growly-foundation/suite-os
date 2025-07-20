'use client';

import { ColumnDef, Row } from '@tanstack/react-table';

import { ImportUserOutput, ParsedUser } from '@getgrowly/core';

import { TableUserData, getFormatter, hasData } from './column-formatters';

// Column definitions for different data types
export const columnDefinitions: Record<string, ColumnDef<TableUserData>> = {
  identity: {
    id: 'identity',
    accessorFn: (row: TableUserData) => {
      const walletAddress =
        'walletAddress' in row ? row.walletAddress || '' : 'id' in row ? row.id : '';
      const name = 'name' in row ? row.name : '';
      return `${name}${walletAddress}`.toLowerCase();
    },
    header: 'Identity',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('identity')(row.original),
    enableSorting: true,
    enableResizing: true,
    meta: { frozen: true },
    size: 200,
  },

  talentProtocolCheckmark: {
    id: 'talentProtocolCheckmark',
    accessorFn: (row: TableUserData) => {
      if ('personaData' in row) {
        // This is a boolean checkmark, sort by presence
        return 'personaData' in row ? 1 : 0;
      }
      return 0;
    },
    header: 'Verified',
    cell: ({ row }: { row: Row<TableUserData> }) =>
      getFormatter('talentProtocolCheckmark')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 80,
  },

  firstSignedIn: {
    id: 'firstSignedIn',
    accessorFn: (row: TableUserData) => {
      const date = 'created_at' in row ? new Date(row.created_at).getTime() : new Date().getTime();
      return date;
    },
    header: 'First Signed In',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('firstSignedIn')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 150,
  },

  trait: {
    id: 'trait',
    accessorFn: (row: TableUserData) => {
      if ('personaData' in row) {
        // Sort by trait name
        return 'personaData' in row ? 'trait' : '';
      }
      return '';
    },
    header: 'Trait',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('trait')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 120,
  },

  portfolioValue: {
    id: 'portfolioValue',
    accessorFn: (row: TableUserData) => {
      if ('personaData' in row) {
        return (row as any).personaData?.portfolio_snapshots?.totalValue || 0;
      }
      return 0;
    },
    header: 'Portfolio Value',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('portfolioValue')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 150,
  },

  transactions: {
    id: 'transactions',
    accessorFn: (row: TableUserData) => {
      if ('personaData' in row) {
        // Calculate actual transaction count from persona data
        const persona = (row as any).personaData;
        if (persona?.activities?.totalTransactions) {
          return persona.activities.totalTransactions;
        }
        // Fallback to calculating from token activity
        if (persona?.activities?.tokenActivity) {
          const tokenActivity = persona.activities.tokenActivity;
          return Object.values(tokenActivity || {}).reduce(
            (sum: number, chain: any) => sum + (chain?.length || 0),
            0
          );
        }
        return 0;
      }
      return 0;
    },
    header: 'Transactions',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('transactions')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 120,
  },

  tokens: {
    id: 'tokens',
    accessorFn: (row: TableUserData) => {
      if ('personaData' in row) {
        const portfolio = (row as any).personaData.portfolio_snapshots.tokenPortfolio
          ?.chainRecordsWithTokens;
        const tokenCount = Object.values(portfolio || {}).reduce(
          (sum: number, chain: any) => sum + chain.tokens.length,
          0
        );
        return tokenCount;
      }
      return 0;
    },
    header: 'Tokens',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('tokens')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 200,
  },

  activity: {
    id: 'activity',
    accessorFn: (row: TableUserData) => {
      if ('personaData' in row) {
        // Sort by activity date if available
        return 'personaData' in row ? new Date().getTime() : 0;
      }
      return 0;
    },
    header: 'Activity',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('activity')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 200,
  },

  walletCreatedAt: {
    id: 'walletCreatedAt',
    accessorFn: (row: TableUserData) => {
      if ('personaData' in row) {
        // This would need the actual wallet creation date
        return new Date().getTime(); // Placeholder
      }
      return 0;
    },
    header: 'Wallet Created At',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('walletCreatedAt')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 150,
  },

  email: {
    id: 'email',
    accessorFn: (row: TableUserData) => {
      const email = 'email' in row ? row.email || '' : '';
      return email.toLowerCase();
    },
    header: 'Email',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('email')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 200,
  },

  contractData: {
    id: 'contractData',
    accessorFn: (row: TableUserData) => {
      if ('extra' in row && row.extra && typeof row.extra === 'object') {
        const extra = row.extra as Record<string, any>;
        return extra.interactionCount || 0;
      }
      return 0;
    },
    header: 'Contract Data',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('contractData')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 200,
  },

  source: {
    id: 'source',
    accessorFn: (row: TableUserData) => {
      const source = 'source' in row ? row.source : '';
      return source.toLowerCase();
    },
    header: 'Source',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('source')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 120,
  },
};

// Function to create dynamic columns based on data type
export function createDynamicColumns<T extends TableUserData>(
  data: T[]
): ColumnDef<TableUserData>[] {
  if (data.length === 0) {
    return [columnDefinitions.identity];
  }

  const columns: ColumnDef<TableUserData>[] = [];
  const sampleUser = data[0];

  // Always include identity column
  columns.push(columnDefinitions.identity);

  // Add columns based on data type detection
  if (hasData<ParsedUser>(sampleUser as ParsedUser, 'personaData')) {
    // ParsedUser columns
    columns.push(
      columnDefinitions.talentProtocolCheckmark,
      columnDefinitions.firstSignedIn,
      columnDefinitions.trait,
      columnDefinitions.portfolioValue,
      columnDefinitions.transactions,
      columnDefinitions.tokens,
      columnDefinitions.activity,
      columnDefinitions.walletCreatedAt
    );
  }

  if (hasData<ImportUserOutput>(sampleUser as ImportUserOutput, 'email')) {
    columns.push(columnDefinitions.email);
  }

  if (hasData<ImportUserOutput>(sampleUser as ImportUserOutput, 'extra')) {
    columns.push(columnDefinitions.contractData);
  }

  if (hasData<ImportUserOutput>(sampleUser as ImportUserOutput, 'source')) {
    columns.push(columnDefinitions.source);
  }

  return columns;
}
