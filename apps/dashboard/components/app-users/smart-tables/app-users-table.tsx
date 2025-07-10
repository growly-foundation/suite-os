'use client';

import { useMemo, useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

import { ResizableSheet } from '../../ui/resizable-sheet';
import { UserDetails } from '../app-user-details';
import { createUserTableColumns } from './app-user-table-columns';
import { HyperSmartTable } from './hyper-smart-table';

const ITEMS_PER_PAGE = 100;

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
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

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

  return (
    <>
      <HyperSmartTable columns={columns} items={users} itemsPerPage={ITEMS_PER_PAGE} />
      <ResizableSheet side="right" open={open} onOpenChange={handleCloseUserDetails}>
        {selectedUser && <UserDetails user={selectedUser} />}
      </ResizableSheet>
    </>
  );
}
