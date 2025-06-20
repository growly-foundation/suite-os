'use client';

import {
  FilterConfig,
  extractTableData,
  filterItems,
  renderColumns,
  renderHeaders,
  sortItems,
} from '@/lib/tables.utils';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

import { PaginatedTable } from '../../ui/paginated-table';
import { ResizableSheet } from '../../ui/resizable-sheet';
import { TableCell, TableHead, TableRow } from '../../ui/table';
import { UserDetails } from '../app-user-details';
import { ExtractedRowData } from '../types';
import { createUserTableColumns } from './app-user-table-columns';
import { SortDirection } from './sort-indicator';
import { SortableHeader } from './sortable-header';

const ITEMS_PER_PAGE = 15;

/**
 * Displays a paginated, sortable table of users with selectable rows and a detail panel.
 *
 * Integrates sorting, selection, and pagination controls, allowing users to view, select, and inspect user details in a side panel.
 *
 * @param users - The list of users to display in the table.
 */
export function UsersTable({ users }: { users: ParsedUser[] }) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ParsedUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: SortDirection }>({
    key: null,
    direction: null,
  });

  // Add filtering state
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');

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
  const columns = useMemo(
    () =>
      createUserTableColumns({
        onUserClick: handleUserClick,
        onCheckboxChange: handleUserSelect,
        selectedUsers,
        onSelectAll: handleSelectAll,
      }),
    [selectedUsers]
  );

  // Extract data from all users upfront for sorting and filtering
  const extractedData = useMemo<Record<string, ExtractedRowData>>(() => {
    const data: Record<string, ExtractedRowData> = {};
    const tableData = extractTableData(users, columns);

    // Store extracted data by user ID for easy access
    users.forEach((user, index) => {
      data[user.id] = tableData[index];
    });

    return data;
  }, [users, columns]);

  // Apply filtering, then sorting to the data
  const filteredAndSortedUsers = useMemo(() => {
    // First filter
    const filtered =
      filters.length > 0 ? filterItems(users, extractedData, filters, user => user.id) : users;

    // Then sort the filtered results
    return sortItems(filtered, sortConfig, columns);
  }, [users, filters, extractedData, sortConfig, columns]);

  // Calculate pagination values
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                {column.contentRenderer(item, extractedData[item.id])}
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
