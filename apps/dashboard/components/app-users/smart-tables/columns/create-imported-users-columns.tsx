import { ColumnDef, Row } from '@tanstack/react-table';

import { ImportUserOutput } from '@getgrowly/core';

import { getFormatter } from './column-formatters';

export const columnImportedUserDefinitions: Record<string, ColumnDef<ImportUserOutput>> = {
  identity: {
    id: 'identity',
    accessorFn: (row: ImportUserOutput) => {
      const identity = row.name || row.email || row.walletAddress || '';
      return identity.toLowerCase();
    },
    header: 'Identity',
    cell: ({ row }: { row: Row<ImportUserOutput> }) => getFormatter('identity')(row.original),
    enableSorting: true,
    enableResizing: true,
    meta: { frozen: true },
    size: 200,
    minSize: 180,
  },
  email: {
    id: 'email',
    accessorFn: (row: ImportUserOutput) => row.email || '',
    header: 'Email',
    cell: ({ row }: { row: Row<ImportUserOutput> }) => getFormatter('email')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 180,
    minSize: 150,
  },
  walletAddress: {
    id: 'walletAddress',
    accessorFn: (row: ImportUserOutput) => row.walletAddress || '',
    header: 'Wallet Address',
    cell: ({ row }: { row: Row<ImportUserOutput> }) => getFormatter('walletAddress')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 160,
    minSize: 120,
  },
  name: {
    id: 'name',
    accessorFn: (row: ImportUserOutput) => row.name || '',
    header: 'Name',
    cell: ({ row }: { row: Row<ImportUserOutput> }) => getFormatter('name')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 120,
    minSize: 100,
  },
  source: {
    id: 'source',
    accessorFn: (row: ImportUserOutput) => row.source || '',
    header: 'Source',
    cell: ({ row }: { row: Row<ImportUserOutput> }) => getFormatter('source')(row.original),
    enableSorting: true,
    enableResizing: true,
    size: 120,
    minSize: 100,
  },
};

export const createImportedUserColumns = (
  data: ImportUserOutput[]
): ColumnDef<ImportUserOutput>[] => {
  if (data.length === 0) {
    return [columnImportedUserDefinitions.identity];
  }

  const columns: ColumnDef<ImportUserOutput>[] = [];
  const sampleUser = data[0];

  // Always include identity column
  columns.push(columnImportedUserDefinitions.identity);

  // Add columns based on available data
  if (sampleUser.email) {
    columns.push(columnImportedUserDefinitions.email);
  }

  if (sampleUser.name) {
    columns.push(columnImportedUserDefinitions.name);
  }

  // If no specific data found, include basic columns anyway
  if (columns.length === 1) {
    columns.push(
      columnImportedUserDefinitions.email,
      columnImportedUserDefinitions.walletAddress,
      columnImportedUserDefinitions.source
    );
  }

  return columns;
};
