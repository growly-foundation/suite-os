'use client';

import { useMemo, useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

import { ResizableSheet } from '../../ui/resizable-sheet';
import { UserDetails } from '../app-user-details';
import { createUserColumns } from './columns/create-user-columns';
import { DynamicTable } from './dynamic-table';

interface SmartUserTableProps {
  data: ParsedUser[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onUserClick?: (user: ParsedUser) => void;
  className?: string;
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
  getRowId?: (row: ParsedUser) => string; // Required when enableRowSelection is true
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
 * - Infinite scrolling support
 * - Row selection support
 */
export function SmartUserTable({
  data,
  isLoading = false,
  emptyMessage = 'No users found',
  emptyDescription = 'There are no users to display. Try importing some users or adjusting your filters.',
  onUserClick,
  className,
  // Pagination props
  enablePagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  // Selection props
  enableRowSelection = false,
  selectedRows = {},
  onRowSelectionChange,
  getRowId,
}: SmartUserTableProps) {
  const [selectedUser, setSelectedUser] = useState<ParsedUser | null>(null);
  const [open, setOpen] = useState(false);

  // Create appropriate columns
  const columns = useMemo(() => {
    return createUserColumns(data);
  }, [data]);

  // Handle user click
  const handleUserClick = (user: ParsedUser) => {
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
        enableSorting={true}
        // Pagination props
        enablePagination={enablePagination}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        // Selection props
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
    </>
  );
}
