import { consumePersona } from '@/core/persona';
import { ColumnDef, Row } from '@tanstack/react-table';

import { ParsedUser } from '@getgrowly/core';

import { getFormatter, hasData } from './column-formatters';

// Hard-coded column definitions for special cases that need custom logic
export const columnUserDefinitions: Record<string, ColumnDef<ParsedUser>> = {
  identity: {
    id: 'identity',
    accessorFn: (row: ParsedUser) => {
      const walletAddress =
        'walletAddress' in row ? row.walletAddress || '' : 'id' in row ? row.id : '';
      const name = 'name' in row ? row.name : '';
      return `${name}${walletAddress}`.toLowerCase();
    },
    header: 'Identity',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('identity')(row.original),
    enableSorting: true,
    enableResizing: true,
    meta: { frozen: true },
    size: 240,
    minSize: 240,
  },

  talentProtocolCheckmark: {
    id: 'talentProtocolCheckmark',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        return 'personaData' in row ? 1 : 0;
      }
      return 0;
    },
    header: 'Verified',
    cell: ({ row }: { row: Row<ParsedUser> }) =>
      getFormatter('talentProtocolCheckmark')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 110,
    minSize: 110,
  },

  firstSignedIn: {
    id: 'firstSignedIn',
    accessorFn: (row: ParsedUser) => {
      const date = 'created_at' in row ? new Date(row.created_at).getTime() : new Date().getTime();
      return date;
    },
    header: 'First Signed In',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('firstSignedIn')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 150,
    minSize: 150,
  },

  trait: {
    id: 'trait',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        return 'personaData' in row ? 'trait' : '';
      }
      return '';
    },
    header: 'Trait',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('trait')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 120,
    minSize: 120,
  },

  portfolioValue: {
    id: 'portfolioValue',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        return (row as any).personaData?.portfolio_snapshots?.totalValue || 0;
      }
      return 0;
    },
    header: 'Portfolio Value',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('portfolioValue')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 160,
    minSize: 160,
  },

  transactions: {
    id: 'transactions',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        const persona = consumePersona(row as any);
        return persona.universalTransactions()?.length || 0;
      }
      return 0;
    },
    header: 'Transactions',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('transactions')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 160,
    minSize: 160,
  },

  tokens: {
    id: 'tokens',
    accessorFn: (row: ParsedUser) => {
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
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('tokens')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 270,
    minSize: 270,
  },

  activity: {
    id: 'activity',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        const persona = consumePersona(row as any);
        return persona.getLatestActivity()?.timestamp || 0;
      }
      return 0;
    },
    header: 'Activity',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('activity')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 400,
    minSize: 400,
  },

  walletCreatedAt: {
    id: 'walletCreatedAt',
    accessorFn: (row: ParsedUser) => {
      if ('personaData' in row) {
        const persona = consumePersona(row as any);
        return persona.walletCreatedAt()?.getTime() || 0;
      }
      return 0;
    },
    header: 'Wallet Created At',
    cell: ({ row }: { row: Row<ParsedUser> }) => getFormatter('walletCreatedAt')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 200,
    minSize: 200,
  },
};

// Function to create dynamic columns based on data type
export function createUserColumns(data: ParsedUser[]): ColumnDef<ParsedUser>[] {
  if (data.length === 0) {
    return [columnUserDefinitions.identity];
  }

  const columns: ColumnDef<ParsedUser>[] = [];

  // Helper function to check if any row has persona data
  const hasPersonaDataInAnyRow = (data: ParsedUser[]): boolean => {
    return data.some(user => hasData(user, 'personaData'));
  };

  // Always include identity column
  columns.push(columnUserDefinitions.identity);

  // Add columns based on data availability across all rows
  if (hasPersonaDataInAnyRow(data)) {
    // ParsedUser columns - check if any user has persona data
    columns.push(
      columnUserDefinitions.talentProtocolCheckmark,
      columnUserDefinitions.firstSignedIn,
      columnUserDefinitions.trait,
      columnUserDefinitions.portfolioValue,
      columnUserDefinitions.transactions,
      columnUserDefinitions.tokens,
      columnUserDefinitions.activity,
      columnUserDefinitions.walletCreatedAt
    );
  }
  return columns;
}
