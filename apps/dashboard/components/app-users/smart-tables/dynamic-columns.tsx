'use client';

import { consumePersona } from '@/core/persona';
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
    size: 240, // Default size for avatar + name + wallet address
    minSize: 240, // Max of: header "Identity" (60px), body content (240px), footer "Total" (40px)
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
    size: 110,
    minSize: 110, // Max of: header "Verified" (60px), body checkmark (80px), footer "X verified" (80px)
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
    minSize: 150, // Max of: header "First Signed In" (120px), body "2 days ago" (150px), footer date range (150px)
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
    minSize: 120, // Max of: header "Trait" (40px), body badge (120px), footer trait summary (120px)
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
    size: 160,
    minSize: 160, // Max of: header "Portfolio Value" (120px), body "$1,234 USD" (150px), footer "$1,234 USD" (150px)
  },

  transactions: {
    id: 'transactions',
    accessorFn: (row: TableUserData) => {
      if ('personaData' in row) {
        const persona = consumePersona(row as any);
        // Calculate actual transaction count from persona data
        return persona.universalTransactions()?.length || 0;
      }
      return 0;
    },
    header: 'Transactions',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('transactions')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 160,
    minSize: 160, // Max of: header "Transactions" (100px), body count (80px), footer total (120px)
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
    size: 270, // Default size for multiple token badges
    minSize: 270, // Max of: header "Tokens" (50px), body token badges (250px), footer total (100px)
  },

  activity: {
    id: 'activity',
    accessorFn: (row: TableUserData) => {
      if ('personaData' in row) {
        const persona = consumePersona(row as any);
        // Sort by activity date if available
        return persona.getLatestActivity()?.timestamp || 0;
      }
      return 0;
    },
    header: 'Activity',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('activity')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 400,
    minSize: 400, // Max of: header "Activity" (70px), body activity preview (200px), footer "X active" (100px)
  },

  walletCreatedAt: {
    id: 'walletCreatedAt',
    accessorFn: (row: TableUserData) => {
      if ('personaData' in row) {
        const persona = consumePersona(row as any);
        return persona.walletCreatedAt()?.getTime() || 0;
      }
      return 0;
    },
    header: 'Wallet Created At',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('walletCreatedAt')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 200,
    minSize: 200, // Max of: header "Wallet Created At" (140px), body "DD/MM/YYYY HH:mm" (150px), footer date range (150px)
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
    minSize: 200, // Max of: header "Email" (50px), body email address (200px), footer (not used)
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
    minSize: 200, // Max of: header "Contract Data" (120px), body contract info (200px), footer (not used)
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
    minSize: 120, // Max of: header "Source" (60px), body source badge (120px), footer (not used)
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
