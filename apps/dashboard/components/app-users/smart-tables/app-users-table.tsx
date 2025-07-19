'use client';

import { useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

import { ResizableSheet } from '../../ui/resizable-sheet';
import { UserDetails } from '../app-user-details';
import { RefactoredUserTable } from './refactored-user-table';

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

  // User interaction handlers
  const handleUserClick = (user: ParsedUser) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleCloseUserDetails = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <RefactoredUserTable
        data={users}
        emptyMessage="No users found"
        emptyDescription="There are no users in your database. Users will appear here once they sign up."
        onUserClick={user => {
          // Type guard to ensure we only handle ParsedUser
          if ('personaData' in user) {
            handleUserClick(user as ParsedUser);
          }
        }}
      />
      <ResizableSheet side="right" open={open} onOpenChange={handleCloseUserDetails}>
        {selectedUser && <UserDetails user={selectedUser} />}
      </ResizableSheet>
    </>
  );
}
