import { CopyTooltip } from '@/components/ui/copy-tooltip';
import { hasDataInAnyRow, hasImportedUserExtraData, hasUsersWithSource } from '@/lib/data.utils';
import { ColumnDef, Row } from '@tanstack/react-table';
import moment from 'moment';

import {
  ContractInteractionMetadata,
  ImportContractUserOutput,
  ImportNftHoldersOutput,
  ImportPrivyUserOutput,
  ImportUserOutput,
  ImportedPrivyUserSourceData,
  NftHoldersMetadata,
  UserImportSource,
} from '@getgrowly/core';

import { getFormatter } from './column-formatters';

const sharedBlockchainColumns = {
  contractAddress: {
    id: 'contractAddress',
    header: 'Contract Address',
    enableSorting: true,
    enableResizing: true,
  },
  chainId: {
    id: 'chainId',
    header: 'Chain ID',
    enableSorting: true,
    enableResizing: true,
  },
};

export const columnImportedUserDefinitions: Record<string, ColumnDef<ImportUserOutput>> = {
  identity: {
    id: 'identity',
    accessorFn: (row: ImportUserOutput) => {
      const identity = row.name || row.email || row.walletAddress || '';
      return identity.toLowerCase();
    },
    header: 'Identity',
    cell: ({ row }: { row: Row<ImportUserOutput> }) => (
      <div className="flex items-center gap-2">
        <CopyTooltip textToCopy={row.original.walletAddress || ''} showIcon={true}>
          {getFormatter('identity')(row.original)}
        </CopyTooltip>
      </div>
    ),
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
  imported: {
    id: 'imported',
    accessorFn: (row: ImportUserOutput) => row.imported || '',
    header: 'Imported',
    enableSorting: true,
    enableResizing: true,
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

export const columnImportedPrivyUserDefinitions: Partial<
  Record<
    keyof (ImportedPrivyUserSourceData['sourceData'] &
      ImportedPrivyUserSourceData['sourceData']['custom']),
    ColumnDef<ImportPrivyUserOutput>
  >
> = {
  createdAt: {
    id: 'createdAt',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.createdAt || '',
    header: 'Created At',
    cell: ({ row }: { row: Row<ImportPrivyUserOutput> }) => (
      <span className="text-xs">{moment(row.original.extra?.createdAt).fromNow()}</span>
    ),
    enableSorting: true,
    enableResizing: true,
  },
  github: {
    id: 'github',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.github || '',
    header: 'Github',
    enableSorting: true,
    enableResizing: true,
  },
  twitter: {
    id: 'twitter',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.twitter || '',
    header: 'Twitter',
    enableSorting: true,
    enableResizing: true,
  },
  discord: {
    id: 'discord',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.discord || '',
    header: 'Discord',
    enableSorting: true,
    enableResizing: true,
  },
  instagram: {
    id: 'instagram',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.instagram || '',
    header: 'Instagram',
    enableSorting: true,
    enableResizing: true,
  },
  linkedin: {
    id: 'linkedin',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.linkedin || '',
    header: 'LinkedIn',
    enableSorting: true,
    enableResizing: true,
  },
  farcaster: {
    id: 'farcaster',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.farcaster || '',
    header: 'Farcaster',
    enableSorting: true,
    enableResizing: true,
  },
  telegram: {
    id: 'telegram',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.telegram || '',
    header: 'Telegram',
    enableSorting: true,
    enableResizing: true,
  },
  google: {
    id: 'google',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.google || '',
    header: 'Google',
    enableSorting: true,
    enableResizing: true,
  },
  firstVerifiedAt: {
    id: 'firstVerifiedAt',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.custom?.firstVerifiedAt || '',
    header: 'First Verified At',
    enableSorting: true,
    enableResizing: true,
  },
  latestVerifiedAt: {
    id: 'latestVerifiedAt',
    accessorFn: (row: ImportPrivyUserOutput) => row.extra?.custom?.latestVerifiedAt || '',
    header: 'Latest Verified At',
    enableSorting: true,
    enableResizing: true,
  },
};

export const columnImportedContractUserDefinitions: Partial<
  Record<keyof ContractInteractionMetadata, ColumnDef<ImportContractUserOutput>>
> = {
  contractAddress: {
    ...sharedBlockchainColumns.contractAddress,
    accessorFn: (row: ImportContractUserOutput) => row.extra?.contractAddress || '',
  },
  chainId: {
    ...sharedBlockchainColumns.chainId,
    accessorFn: (row: ImportContractUserOutput) => row.extra?.chainId ?? null,
    sortUndefined: 'last',
  },
  transactionCount: {
    id: 'transactionCount',
    accessorFn: (row: ImportContractUserOutput) => row.extra?.transactionCount ?? 0,
    header: 'Transaction Count',
    enableSorting: true,
    enableResizing: true,
    sortUndefined: 'last',
  },
  firstInteraction: {
    id: 'firstInteraction',
    accessorFn: (row: ImportContractUserOutput) => row.extra?.firstInteraction || '',
    header: 'First Interaction',
    cell: ({ row }: { row: Row<ImportContractUserOutput> }) => (
      <span className="text-xs">{moment(row.original.extra?.firstInteraction).fromNow()}</span>
    ),
    enableSorting: true,
    enableResizing: true,
  },
  lastInteraction: {
    id: 'lastInteraction',
    accessorFn: (row: ImportContractUserOutput) => row.extra?.lastInteraction || '',
    header: 'Last Interaction',
    cell: ({ row }: { row: Row<ImportContractUserOutput> }) => (
      <span className="text-xs">{moment(row.original.extra?.lastInteraction).fromNow()}</span>
    ),
    enableSorting: true,
    enableResizing: true,
  },
};

export const columnImportedNftHoldersUserDefinitions: Partial<
  Record<keyof NftHoldersMetadata, ColumnDef<ImportNftHoldersOutput>>
> = {
  contractAddress: {
    ...sharedBlockchainColumns.contractAddress,
    accessorFn: (row: ImportNftHoldersOutput) => row.extra?.contractAddress || '',
  },
  chainId: {
    ...sharedBlockchainColumns.chainId,
    accessorFn: (row: ImportNftHoldersOutput) => row.extra?.chainId ?? null,
    sortUndefined: 'last',
  },
  totalTokensOwned: {
    id: 'totalTokensOwned',
    accessorFn: (row: ImportNftHoldersOutput) => row.extra?.totalTokensOwned ?? 0,
    header: 'Total Tokens Owned',
    enableSorting: true,
    enableResizing: true,
  },
  uniqueTokensOwned: {
    id: 'uniqueTokensOwned',
    accessorFn: (row: ImportNftHoldersOutput) => row.extra?.uniqueTokensOwned ?? 0,
    header: 'Unique Tokens Owned',
    enableSorting: true,
    enableResizing: true,
  },
};

export function createImportedUserColumns<T extends ImportUserOutput>(data: T[]): ColumnDef<T>[] {
  if (data.length === 0) {
    return [columnImportedUserDefinitions.identity as ColumnDef<T>];
  }

  const columns: ColumnDef<T>[] = [];

  // Always include identity column
  columns.push(columnImportedUserDefinitions.identity as ColumnDef<T>);

  // Add columns based on available data across all rows
  if (hasDataInAnyRow(data, 'email')) {
    columns.push(columnImportedUserDefinitions.email as ColumnDef<T>);
  }

  if (hasDataInAnyRow(data, 'name')) {
    columns.push(columnImportedUserDefinitions.name as ColumnDef<T>);
  }

  columns.push(columnImportedUserDefinitions.imported as ColumnDef<T>);

  if (hasUsersWithSource(data, UserImportSource.Privy)) {
    // Add Privy-specific columns if any Privy user has the data
    for (const { field, column } of [
      { field: 'createdAt', column: columnImportedPrivyUserDefinitions.createdAt },
      { field: 'github', column: columnImportedPrivyUserDefinitions.github },
      { field: 'twitter', column: columnImportedPrivyUserDefinitions.twitter },
      { field: 'discord', column: columnImportedPrivyUserDefinitions.discord },
      { field: 'instagram', column: columnImportedPrivyUserDefinitions.instagram },
      { field: 'linkedin', column: columnImportedPrivyUserDefinitions.linkedin },
      { field: 'farcaster', column: columnImportedPrivyUserDefinitions.farcaster },
      { field: 'telegram', column: columnImportedPrivyUserDefinitions.telegram },
      { field: 'google', column: columnImportedPrivyUserDefinitions.google },
      {
        field: 'custom.firstVerifiedAt',
        column: columnImportedPrivyUserDefinitions.firstVerifiedAt,
      },
      {
        field: 'custom.latestVerifiedAt',
        column: columnImportedPrivyUserDefinitions.latestVerifiedAt,
      },
    ]) {
      if (hasImportedUserExtraData(data, UserImportSource.Privy, field)) {
        columns.push(column as ColumnDef<T>);
      }
    }
  }

  if (hasUsersWithSource(data, UserImportSource.Contract)) {
    // Add Contract-specific columns if any Contract user has the data
    for (const { field, column } of [
      { field: 'transactionCount', column: columnImportedContractUserDefinitions.transactionCount },
      { field: 'firstInteraction', column: columnImportedContractUserDefinitions.firstInteraction },
      { field: 'lastInteraction', column: columnImportedContractUserDefinitions.lastInteraction },
    ]) {
      if (hasImportedUserExtraData(data, UserImportSource.Contract, field)) {
        columns.push(column as ColumnDef<T>);
      }
    }
  }

  if (hasUsersWithSource(data, UserImportSource.NftHolders)) {
    for (const { field, column } of [
      {
        field: 'totalTokensOwned',
        column: columnImportedNftHoldersUserDefinitions.totalTokensOwned,
      },
      {
        field: 'uniqueTokensOwned',
        column: columnImportedNftHoldersUserDefinitions.uniqueTokensOwned,
      },
    ]) {
      if (hasImportedUserExtraData(data, UserImportSource.NftHolders, field)) {
        columns.push(column as ColumnDef<T>);
      }
    }
  }

  // If no specific data found, include basic columns anyway
  if (columns.length === 1) {
    columns.push(
      columnImportedUserDefinitions.email as ColumnDef<T>,
      columnImportedUserDefinitions.walletAddress as ColumnDef<T>,
      columnImportedUserDefinitions.source as ColumnDef<T>
    );
  }

  return columns;
}
