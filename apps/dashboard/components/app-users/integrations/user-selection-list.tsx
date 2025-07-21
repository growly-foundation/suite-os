'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { ColumnDef } from '@tanstack/react-table';
import { ImportIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { ImportUserOutput } from '@getgrowly/core';

import { createImportedUserColumns } from '../smart-tables/columns/create-imported-users-columns';
import { DynamicTable } from '../smart-tables/dynamic-table';

interface UserSelectionListProps<T extends ImportUserOutput = ImportUserOutput> {
  users: T[];
  importButtonText?: string;
  onImport: (selectedUserIds: string[]) => Promise<void>;
  additionalActions?: React.ReactNode;
  isImporting?: boolean;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
}

export function UserSelectionList<T extends ImportUserOutput = ImportUserOutput>({
  users,
  importButtonText = 'Import Users',
  onImport,
  additionalActions,
  isImporting = false,
  searchQuery,
  setSearchQuery,
}: UserSelectionListProps<T>) {
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

  // Handle import action
  const handleImport = async () => {
    const selectedUserIds = Object.entries(selectedUsers)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);

    await onImport(selectedUserIds);
  };

  // Count of selected users
  const selectedCount = Object.values(selectedUsers).filter(Boolean).length;
  const columns = createImportedUserColumns(users);

  // Improved getRowId function to ensure proper row identification
  const getRowId = (row: ImportUserOutput) => {
    // Try wallet address first, then email, then fallback to index
    if (row.walletAddress) {
      return row.walletAddress;
    }
    if (row.email) {
      return row.email;
    }
    // Fallback to a combination of available fields
    return `${row.source || 'unknown'}-${row.walletAddress || row.email || 'unknown'}`;
  };

  // Handle row selection change with debugging
  const handleRowSelectionChange = (newSelection: Record<string, boolean>) => {
    console.log('Row selection changed:', newSelection);
    setSelectedUsers(newSelection);
  };

  // Footer data calculation - adapted for imported users
  const getFooterValue = (key: string) => {
    switch (key) {
      case 'identity':
        return `${users.length} users`;
      case 'email':
        const emailCount = users.reduce((sum, user) => {
          return sum + (user.email ? 1 : 0);
        }, 0);
        return `${emailCount} with email`;
      case 'walletAddress':
        const walletAddressCount = users.reduce((sum, user) => {
          return sum + (user.walletAddress ? 1 : 0);
        }, 0);
        return `${walletAddressCount} with wallet address`;
      default:
        return '';
    }
  };

  // Create import button for toolbar
  const importButton = (
    <PrimaryButton onClick={handleImport} disabled={isImporting || selectedCount === 0} size="sm">
      {isImporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ImportIcon className="mr-1 h-4 w-4" />
      )}
      {isImporting ? 'Importing...' : importButtonText || `Import ${selectedCount} Users`}
    </PrimaryButton>
  );

  // Combine additional actions with import button
  const toolbarActions = (
    <div className="flex items-center gap-2">
      {additionalActions}
      {importButton}
    </div>
  );

  return (
    <DynamicTable<ImportUserOutput>
      data={users as ImportUserOutput[]}
      columns={columns as ColumnDef<ImportUserOutput>[]}
      tableLabel={`${selectedCount} of ${users.length} selected`}
      emptyMessage="No users found"
      emptyDescription="No users to import. Please refresh your credentials."
      enableColumnResizing={true}
      enableColumnReordering={true}
      enableSorting={true}
      enableRowSelection={true}
      selectedRows={selectedUsers}
      onRowSelectionChange={handleRowSelectionChange}
      getRowId={getRowId}
      enableFooter={true}
      getFooterValue={getFooterValue}
      initialSorting={[{ id: 'identity', desc: true }]}
      // Enable pagination
      enablePagination={true}
      pageSize={20} // Show 20 users per page
      // Toolbar props
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      searchPlaceholder="Search ENS or address"
      additionalActions={toolbarActions}
      className="h-full"
    />
  );
}
