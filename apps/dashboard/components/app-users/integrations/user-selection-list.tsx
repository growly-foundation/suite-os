'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { ColumnDef } from '@tanstack/react-table';
import { ImportIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { ImportLimitCheckResult, ImportUserOutput } from '@getgrowly/core';

import { createImportedUserColumns } from '../smart-tables/columns/create-imported-users-columns';
import { DynamicTable } from '../smart-tables/dynamic-table';

interface UserSelectionListProps<T extends ImportUserOutput = ImportUserOutput> {
  users: T[];
  importButtonText?: string;
  onImport: (selectedUserIds: string[]) => Promise<void>;
  onSelectionChange?: (selectedUserIds: string[]) => void;
  additionalActions?: React.ReactNode;
  isImporting?: boolean;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  limits?: ImportLimitCheckResult | null;
  // Pagination props for large user lists
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onLoadMore?: (pageInfo: { page: number; pageSize: number }) => Promise<void>;
  hasMore?: boolean;
  loadingMore?: boolean;
  // Container height for proper scrolling
  height?: string;
}

export function UserSelectionList<T extends ImportUserOutput = ImportUserOutput>({
  users,
  importButtonText = 'Import Users',
  onImport,
  onSelectionChange,
  additionalActions,
  isImporting = false,
  searchQuery,
  setSearchQuery,
  limits,
  // Pagination props
  pageSize = 20,
  currentPage = 0,
  totalItems,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  // Container height
  height = 'h-full',
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

  // Check if import should be disabled
  const isImportDisabled = () => {
    if (isImporting || selectedCount === 0) return true;

    // If limits are available, check if import is possible
    if (limits) {
      if (!limits.canImport) return true;
      if (limits.exceedsLimit && limits.maxAllowedImports === 0) return true;
    }

    return false;
  };

  // Get import button text based on limits
  const getImportButtonText = () => {
    if (isImporting) return 'Importing...';
    if (selectedCount === 0) return 'Select users to import';

    if (limits) {
      if (!limits.canImport) {
        return `Cannot import - limit reached (${limits.currentUserCount}/${limits.maxUsers})`;
      }
      if (limits.exceedsLimit) {
        if (limits.maxAllowedImports === 0) {
          return `Cannot import - no slots available`;
        }
        return `Import ${Math.min(selectedCount, limits.maxAllowedImports)} users (limited)`;
      }
    }

    return importButtonText || `Import ${selectedCount} Users`;
  };

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

    // Notify parent component of selection change
    if (onSelectionChange) {
      const selectedUserIds = Object.entries(newSelection)
        .filter(([, isSelected]) => isSelected)
        .map(([id]) => id);
      onSelectionChange(selectedUserIds);
    }
  };

  // Footer data calculation - adapted for imported users
  const getFooterValue = (key: string) => {
    const displayedCount = users.length;
    const totalCount = totalItems || users.length;

    switch (key) {
      case 'identity':
        return totalCount > displayedCount
          ? `${displayedCount} of ${totalCount} users shown`
          : `${totalCount} users`;
      case 'email': {
        const emailCount = users.reduce((sum, user) => {
          return sum + (user.email ? 1 : 0);
        }, 0);
        return `${emailCount} with email`;
      }
      case 'walletAddress': {
        const walletAddressCount = users.reduce((sum, user) => {
          return sum + (user.walletAddress ? 1 : 0);
        }, 0);
        return `${walletAddressCount} with wallet address`;
      }
      default:
        return '';
    }
  };

  // Create import button for toolbar
  const importButton = (
    <PrimaryButton
      onClick={handleImport}
      disabled={isImportDisabled()}
      size="sm"
      title={isImportDisabled() ? getImportButtonText() : undefined}>
      {isImporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ImportIcon className="mr-1 h-4 w-4" />
      )}
      {getImportButtonText()}
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
      tableLabel={`${selectedCount} of ${totalItems || users.length} selected`}
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
      // Pagination props
      pageSize={pageSize}
      currentPage={currentPage}
      totalItems={totalItems || users.length}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
      // Toolbar props
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      searchPlaceholder="Search ENS or address"
      additionalActions={toolbarActions}
      className={height}
    />
  );
}
