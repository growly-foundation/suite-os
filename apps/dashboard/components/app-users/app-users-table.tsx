'use client';

import { renderColumns, renderHeaders, sortItems } from '@/lib/tables.utils';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

import { PaginatedTable } from '../ui/paginated-table';
import { ResizableSheet } from '../ui/resizable-sheet';
import { SortDirection } from '../ui/sort-indicator';
import { SortableHeader } from '../ui/sortable-header';
import { TableCell, TableHead, TableRow } from '../ui/table';
import { UserDetails } from './app-user-details';
import { createUserTableColumns } from './app-user-table-columns';

const ITEMS_PER_PAGE = 15;

export function UsersTable({ users }: { users: ParsedUser[] }) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ParsedUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: SortDirection }>({
    key: null,
    direction: null,
  });

  // User interaction handlers
  const handleUserClick = (user: ParsedUser) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: checked,
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(
        users.reduce<Record<string, boolean>>((acc, user) => {
          acc[user.id] = true;
          return acc;
        }, {})
      );
    } else {
      setSelectedUsers({});
    }
  };

  const handleCloseUserDetails = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  // Handle sorting change
  const handleSort = (key: string, direction: SortDirection) => {
    setSortConfig({ key, direction });
  };

  // Navigation handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    goToPage(currentPage - 1);
  };

  // Create dynamic columns
  const columns = createUserTableColumns({
    onUserClick: handleUserClick,
    onCheckboxChange: handleUserSelect,
    selectedUsers,
    onSelectAll: handleSelectAll,
  });

  // Apply sorting to the data
  const sortedUsers = useMemo(() => {
    return sortItems(users, sortConfig, columns);
  }, [users, sortConfig, columns]);

  // Calculate pagination values
  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      <PaginatedTable
        header={
          <TableRow>
            {renderHeaders(columns, column => (
              <TableHead key={column.key} border={column.border} className={column.className}>
                <SortableHeader
                  column={column}
                  sortKey={sortConfig.key}
                  sortDirection={sortConfig.direction}
                  onSort={handleSort}
                />
              </TableHead>
            ))}
          </TableRow>
        }
        content={paginatedUsers.map(user => (
          <TableRow
            key={user.id}
            className={cn('hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors')}>
            {renderColumns(user, columns, (column, item) => (
              <TableCell key={column.key} border={column.border} className={column.className}>
                {column.contentRenderer(item)}
              </TableCell>
            ))}
          </TableRow>
        ))}
        pagination={{
          startIndex,
          currentPage,
          totalItems,
          itemsPerPage: ITEMS_PER_PAGE,
          totalPages,
          goToPage,
          nextPage: goToNextPage,
          prevPage: goToPrevPage,
        }}
      />

      <ResizableSheet side="right" open={open} onOpenChange={handleCloseUserDetails}>
        {selectedUser && <UserDetails user={selectedUser} />}
      </ResizableSheet>
    </>
  );
}
