'use client';

import { useMemo, useState } from 'react';

import { ImportPrivyUserOutput, ImportUserOutput, ParsedUser } from '@getgrowly/core';

import { ResizableSheet } from '../../ui/resizable-sheet';
import { UserDetails } from '../app-user-details';
import { TableUserData } from './column-formatters';
import { createDynamicColumns, detectDataType } from './dynamic-columns';
import { DynamicTable } from './dynamic-table';

const ITEMS_PER_PAGE = 100;

interface RefactoredUserTableProps {
  data: TableUserData[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onUserClick?: (user: TableUserData) => void;
  className?: string;
}

/**
 * A refactored user table component that can handle multiple data types dynamically.
 *
 * Features:
 * - Dynamic column detection based on data type
 * - Column resizing and reordering
 * - Column visibility management
 * - Empty state handling
 * - Support for ParsedUser, ImportUserOutput, and ImportPrivyUserOutput
 */
export function RefactoredUserTable({
  data,
  isLoading = false,
  emptyMessage = 'No users found',
  emptyDescription = 'There are no users to display. Try importing some users or adjusting your filters.',
  onUserClick,
  className,
}: RefactoredUserTableProps) {
  const [selectedUser, setSelectedUser] = useState<TableUserData | null>(null);
  const [open, setOpen] = useState(false);

  // Detect data type and create appropriate columns
  const columns = useMemo(() => {
    const dataType = detectDataType(data);
    return createDynamicColumns(data);
  }, [data]);

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
    <>
      <DynamicTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        emptyDescription={emptyDescription}
        onRowClick={handleUserClick}
        className={className}
        enableColumnResizing={true}
        enableColumnReordering={true}
        enableColumnVisibility={true}
        enableSorting={true}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      {/* User Details Sheet */}
      <ResizableSheet side="right" open={open} onOpenChange={handleCloseUserDetails}>
        {selectedUser && 'personaData' in selectedUser && (
          <UserDetails user={selectedUser as ParsedUser} />
        )}
      </ResizableSheet>
    </>
  );
}

// Specialized table components for different data types
export function ParsedUserTable({
  users,
  ...props
}: {
  users: ParsedUser[];
} & Omit<RefactoredUserTableProps, 'data'>) {
  return (
    <RefactoredUserTable
      data={users}
      emptyMessage="No users found"
      emptyDescription="There are no users in your database. Users will appear here once they sign up."
      {...props}
    />
  );
}

export function PrivyUserTable({
  users,
  ...props
}: {
  users: ImportPrivyUserOutput[];
} & Omit<RefactoredUserTableProps, 'data'>) {
  return (
    <RefactoredUserTable
      data={users}
      emptyMessage="No Privy users found"
      emptyDescription="No Privy users were imported. Try importing users from Privy."
      {...props}
    />
  );
}

export function ContractUserTable({
  users,
  ...props
}: {
  users: ImportUserOutput[];
} & Omit<RefactoredUserTableProps, 'data'>) {
  return (
    <RefactoredUserTable
      data={users}
      emptyMessage="No contract users found"
      emptyDescription="No contract users were imported. Try importing users from a contract."
      {...props}
    />
  );
}

export function MixedUserTable({
  users,
  ...props
}: {
  users: TableUserData[];
} & Omit<RefactoredUserTableProps, 'data'>) {
  return (
    <RefactoredUserTable
      data={users}
      emptyMessage="No users found"
      emptyDescription="There are no users to display. Try importing some users or adjusting your filters."
      {...props}
    />
  );
}
