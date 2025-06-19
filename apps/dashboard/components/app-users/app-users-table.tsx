'use client';

import { useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

import { Checkbox } from '../ui/checkbox';
import { PaginatedTable } from '../ui/paginated-table';
import { ResizableSheet } from '../ui/resizable-sheet';
import { TableHead, TableRow } from '../ui/table';
import { UserDetails } from './app-user-details';
import { UserTableItem } from './app-users-table-item';

const ITEMS_PER_PAGE = 15;

export function UsersTable({ users }: { users: ParsedUser[] }) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ParsedUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

  // Calculate pagination
  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const handleUserClick = (user: ParsedUser) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  const handleCloseUserDetails = () => {
    setOpen(false);
    closeUserDetails();
  };

  return (
    <div>
      <PaginatedTable
        className="border-b"
        header={
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                className="border-gray-450"
                checked={Object.values(selectedUsers).some(Boolean)}
                onCheckedChange={checked => {
                  if (checked) {
                    setSelectedUsers(
                      users.reduce(
                        (acc, user) => {
                          acc[user.id] = true;
                          return acc;
                        },
                        {} as Record<string, boolean>
                      )
                    );
                  } else {
                    setSelectedUsers({});
                  }
                }}
              />
            </TableHead>
            <TableHead className="w-[100px]">User</TableHead>
            <TableHead>Portfolio Value</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Trait</TableHead>
            <TableHead>Tokens</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        }
        content={paginatedUsers.map(user => (
          <UserTableItem
            key={user.id}
            user={user}
            handleUserClick={handleUserClick}
            selected={selectedUsers[user.id] || false}
            onCheckedChange={checked => {
              setSelectedUsers({
                ...selectedUsers,
                [user.id]: checked,
              });
            }}
          />
        ))}
        pagination={{
          startIndex,
          totalItems,
          itemsPerPage: ITEMS_PER_PAGE,
          currentPage,
          prevPage,
          nextPage,
          goToPage,
          totalPages,
        }}
      />
      {/* User Details Drawer */}
      <ResizableSheet side="right" open={open} onOpenChange={handleCloseUserDetails}>
        {selectedUser && <UserDetails user={selectedUser} />}
      </ResizableSheet>
    </div>
  );
}
