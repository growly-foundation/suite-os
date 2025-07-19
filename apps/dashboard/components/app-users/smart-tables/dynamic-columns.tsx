'use client';

import { ColumnDef, Row } from '@tanstack/react-table';

import { TableUserData, getFormatter, hasData } from './column-formatters';

// Column definitions for different data types
export const columnDefinitions = {
  identity: {
    id: 'identity',
    accessorFn: (row: TableUserData) => row,
    header: 'User',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('identity')(row.original),
    enableSorting: false,
    enableHiding: false,
    size: 200,
  },

  talentProtocolCheckmark: {
    id: 'talentProtocolCheckmark',
    accessorFn: (row: TableUserData) => row,
    header: 'Verified',
    cell: ({ row }: { row: Row<TableUserData> }) =>
      getFormatter('talentProtocolCheckmark')(row.original),
    enableSorting: false,
    size: 80,
  },

  firstSignedIn: {
    id: 'firstSignedIn',
    accessorFn: (row: TableUserData) => row,
    header: 'First Signed In',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('firstSignedIn')(row.original),
    enableSorting: true,
    size: 150,
  },

  trait: {
    id: 'trait',
    accessorFn: (row: TableUserData) => row,
    header: 'Trait',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('trait')(row.original),
    enableSorting: true,
    size: 120,
  },

  portfolioValue: {
    id: 'portfolioValue',
    accessorFn: (row: TableUserData) => row,
    header: 'Portfolio Value',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('portfolioValue')(row.original),
    enableSorting: true,
    size: 150,
  },

  transactions: {
    id: 'transactions',
    accessorFn: (row: TableUserData) => row,
    header: 'Transactions',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('transactions')(row.original),
    enableSorting: true,
    size: 120,
  },

  tokens: {
    id: 'tokens',
    accessorFn: (row: TableUserData) => row,
    header: 'Tokens',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('tokens')(row.original),
    enableSorting: true,
    size: 200,
  },

  activity: {
    id: 'activity',
    accessorFn: (row: TableUserData) => row,
    header: 'Activity',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('activity')(row.original),
    enableSorting: true,
    size: 200,
  },

  walletCreatedAt: {
    id: 'walletCreatedAt',
    accessorFn: (row: TableUserData) => row,
    header: 'Wallet Created At',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('walletCreatedAt')(row.original),
    enableSorting: true,
    size: 150,
  },

  email: {
    id: 'email',
    accessorFn: (row: TableUserData) => row,
    header: 'Email',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('email')(row.original),
    enableSorting: true,
    size: 200,
  },

  contractData: {
    id: 'contractData',
    accessorFn: (row: TableUserData) => row,
    header: 'Contract Data',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('contractData')(row.original),
    enableSorting: false,
    size: 200,
  },

  source: {
    id: 'source',
    accessorFn: (row: TableUserData) => row,
    header: 'Source',
    cell: ({ row }: { row: Row<TableUserData> }) => getFormatter('source')(row.original),
    enableSorting: true,
    size: 120,
  },
};

// Function to create dynamic columns based on data type
export function createDynamicColumns(data: TableUserData[]): ColumnDef<TableUserData>[] {
  if (data.length === 0) {
    return [columnDefinitions.identity];
  }

  const columns: ColumnDef<TableUserData>[] = [];
  const sampleUser = data[0];

  // Always include identity column
  columns.push(columnDefinitions.identity);

  // Add columns based on data type detection
  if (hasData(sampleUser, 'personaData')) {
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

  if (hasData(sampleUser, 'email')) {
    columns.push(columnDefinitions.email);
  }

  if (hasData(sampleUser, 'extra')) {
    columns.push(columnDefinitions.contractData);
  }

  if (hasData(sampleUser, 'source')) {
    columns.push(columnDefinitions.source);
  }

  return columns;
}

// Function to create columns for specific data types
export function createColumnsForType(
  dataType: 'parsed' | 'privy' | 'contract' | 'mixed'
): ColumnDef<TableUserData>[] {
  switch (dataType) {
    case 'parsed':
      return [
        columnDefinitions.identity,
        columnDefinitions.talentProtocolCheckmark,
        columnDefinitions.firstSignedIn,
        columnDefinitions.trait,
        columnDefinitions.portfolioValue,
        columnDefinitions.transactions,
        columnDefinitions.tokens,
        columnDefinitions.activity,
        columnDefinitions.walletCreatedAt,
      ];

    case 'privy':
      return [columnDefinitions.identity, columnDefinitions.email, columnDefinitions.source];

    case 'contract':
      return [columnDefinitions.identity, columnDefinitions.contractData, columnDefinitions.source];

    case 'mixed':
    default:
      return [
        columnDefinitions.identity,
        columnDefinitions.talentProtocolCheckmark,
        columnDefinitions.firstSignedIn,
        columnDefinitions.trait,
        columnDefinitions.portfolioValue,
        columnDefinitions.transactions,
        columnDefinitions.tokens,
        columnDefinitions.activity,
        columnDefinitions.walletCreatedAt,
        columnDefinitions.email,
        columnDefinitions.contractData,
        columnDefinitions.source,
      ];
  }
}

// Function to detect data type from sample data
export function detectDataType(data: TableUserData[]): 'parsed' | 'privy' | 'contract' | 'mixed' {
  if (data.length === 0) return 'mixed';

  const sampleUser = data[0];
  const hasPersonaData = hasData(sampleUser, 'personaData');
  const hasEmail = hasData(sampleUser, 'email');
  const hasContractData = hasData(sampleUser, 'extra');

  if (hasPersonaData && !hasEmail && !hasContractData) return 'parsed';
  if (hasEmail && !hasPersonaData && !hasContractData) return 'privy';
  if (hasContractData && !hasPersonaData && !hasEmail) return 'contract';

  return 'mixed';
}
