'use client';

import { Download, Users } from 'lucide-react';
import { useState } from 'react';

import { ImportPrivyUserOutput, ImportUserOutput, ParsedUser } from '@getgrowly/core';

import { Button } from '../../ui/button';
import { ResizableSheet } from '../../ui/resizable-sheet';
import { UserDetails } from '../app-user-details';
import { TableUserData } from './column-formatters';
import { SmartUserTable } from './smart-user-table';

interface EnhancedUserTableProps {
  data: TableUserData[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onUserClick?: (user: TableUserData) => void;
  className?: string;
  showImportButton?: boolean;
  onImportClick?: () => void;
  importButtonText?: string;
  // Pagination props
  enablePagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Selection props
  enableRowSelection?: boolean;
  selectedRows?: Record<string, boolean>;
  onRowSelectionChange?: (selectedRows: Record<string, boolean>) => void;
  getRowId?: (row: TableUserData) => string;
}

/**
 * Enhanced user table component with "Views" button and import functionality.
 *
 * Features:
 * - Dynamic table with column management
 * - "Views" button for column visibility
 * - Import button integration
 * - Empty state handling
 * - Support for multiple data types
 * - Infinite scrolling support
 * - Row selection support
 */
export function EnhancedUserTable({
  data,
  isLoading = false,
  emptyMessage = 'No users found',
  emptyDescription = 'There are no users to display. Try importing some users or adjusting your filters.',
  onUserClick,
  className,
  showImportButton = true,
  onImportClick,
  importButtonText = 'Import Users',
  enablePagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  enableRowSelection = false,
  selectedRows = {},
  onRowSelectionChange,
  getRowId,
}: EnhancedUserTableProps) {
  const [selectedUser, setSelectedUser] = useState<TableUserData | null>(null);
  const [open, setOpen] = useState(false);

  // Handle user click
  const handleUserClick = (user: TableUserData) => {
    setSelectedUser(user);
    setOpen(true);
    onUserClick?.(user);
  };

  // Handle close
  const handleCloseUserDetails = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Users</h2>
          {data.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({data.length} {data.length === 1 ? 'user' : 'users'})
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {showImportButton && onImportClick && (
            <Button onClick={onImportClick} size="sm">
              <Download className="mr-2 h-4 w-4" />
              {importButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <SmartUserTable
        data={data}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        emptyDescription={emptyDescription}
        onUserClick={handleUserClick}
        className={className}
        enablePagination={enablePagination}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        enableRowSelection={enableRowSelection}
        selectedRows={selectedRows}
        onRowSelectionChange={onRowSelectionChange}
        getRowId={getRowId}
      />

      {/* User Details Sheet */}
      <ResizableSheet side="right" open={open} onOpenChange={handleCloseUserDetails}>
        {selectedUser && 'personaData' in selectedUser && (
          <UserDetails user={selectedUser as ParsedUser} />
        )}
      </ResizableSheet>
    </div>
  );
}

// Specialized components for different data types
export function EnhancedParsedUserTable({
  users,
  ...props
}: {
  users: ParsedUser[];
} & Omit<EnhancedUserTableProps, 'data'>) {
  return (
    <EnhancedUserTable
      data={users}
      emptyMessage="No users found"
      emptyDescription="There are no users in your database. Users will appear here once they sign up."
      importButtonText="Import Users"
      {...props}
    />
  );
}

export function EnhancedPrivyUserTable({
  users,
  ...props
}: {
  users: ImportPrivyUserOutput[];
} & Omit<EnhancedUserTableProps, 'data'>) {
  return (
    <EnhancedUserTable
      data={users}
      emptyMessage="No Privy users found"
      emptyDescription="No Privy users were imported. Try importing users from Privy."
      importButtonText="Import from Privy"
      {...props}
    />
  );
}

export function EnhancedContractUserTable({
  users,
  ...props
}: {
  users: ImportUserOutput[];
} & Omit<EnhancedUserTableProps, 'data'>) {
  return (
    <EnhancedUserTable
      data={users}
      emptyMessage="No contract users found"
      emptyDescription="No contract users were imported. Try importing users from a contract."
      importButtonText="Import from Contract"
      {...props}
    />
  );
}

export function EnhancedMixedUserTable({
  users,
  ...props
}: {
  users: TableUserData[];
} & Omit<EnhancedUserTableProps, 'data'>) {
  return (
    <EnhancedUserTable
      data={users}
      emptyMessage="No users found"
      emptyDescription="There are no users to display. Try importing some users or adjusting your filters."
      importButtonText="Import Users"
      {...props}
    />
  );
}
