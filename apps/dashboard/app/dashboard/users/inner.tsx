'use client';

import { ImportUserButton } from '@/components/app-users/integrations/import-user-button';
import { UsersTable } from '@/components/app-users/smart-tables/app-users-table';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { suiteCore } from '@/core/suite';
import { useSelectedOrganizationUsersEffect } from '@/hooks/use-organization-effect';
import { Loader2, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { ParsedUser } from '@getgrowly/core';

export function UserDirectoryLayout({
  users,
  loading,
  importEnabled,
  hasMoreUsers,
  isLoadingMore,
  onLoadMore,
  totalUsers,
  refresh,
}: {
  users: ParsedUser[];
  loading: boolean;
  importEnabled: boolean;
  hasMoreUsers?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  totalUsers?: number;
  refresh: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter users (optimized - use existing persona data instead of calling consumePersona)
  // TODO: Improve with fuzzy search
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;

    // Use existing persona data directly instead of calling consumePersona
    const identities = user.personaData?.identities;
    const searchLower = searchQuery.toLowerCase();

    // Search in wallet address and available identity data
    return (
      user.entities.walletAddress?.toLowerCase().includes(searchLower) ||
      (identities &&
        Object.values(identities).some(
          identity =>
            typeof identity === 'object' &&
            identity &&
            'name' in identity &&
            typeof identity.name === 'string' &&
            identity.name.toLowerCase().includes(searchLower)
        ))
    );
  });

  const selectedUserCount = Object.keys(selectedRows).length;

  const handleDeleteSelectedUsers = async () => {
    setDeleting(true);
    try {
      await suiteCore.users.deleteUsers(Object.keys(selectedRows));
      setSelectedRows({});
      setShowDeleteConfirm(false);
      toast.success(`${selectedUserCount} users deleted successfully`);
      // Refresh the data after successful deletion
      refresh();
    } catch (error) {
      toast.error('Failed to delete users');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <React.Fragment>
      <React.Fragment>
        <UsersTable
          loading={loading}
          users={filteredUsers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSelectedRows={setSelectedRows}
          selectedRows={selectedRows}
          hasMoreUsers={hasMoreUsers}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
          totalUsers={totalUsers}
          additionalActions={
            importEnabled ? (
              <div className="flex items-center gap-2">
                <ImportUserButton />
                {Object.keys(selectedRows).length > 0 && (
                  <Button
                    size="sm"
                    onClick={handleDeleteClick}
                    disabled={deleting}
                    variant="destructive">
                    {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 />}
                    {deleting ? 'Deleting...' : `Delete ${Object.keys(selectedRows).length} users`}
                  </Button>
                )}
              </div>
            ) : undefined
          }
        />

        <ConfirmationDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Users"
          description={`Are you sure you want to delete ${selectedUserCount} user${selectedUserCount > 1 ? 's' : ''}? This action cannot be undone and will permanently remove all user data including their conversation history.`}
          confirmLabel={`Delete ${selectedUserCount} User${selectedUserCount > 1 ? 's' : ''}`}
          cancelLabel="Cancel"
          onConfirm={handleDeleteSelectedUsers}
          loading={deleting}
          variant="destructive"
        />
      </React.Fragment>
    </React.Fragment>
  );
}

export function UsersInner() {
  const {
    organizationUsers,
    organizationUserStatus,
    loadMoreUsers,
    hasMoreUsers,
    isLoadingMore,
    totalUsers,
    refresh,
  } = useSelectedOrganizationUsersEffect(20);

  return (
    <UserDirectoryLayout
      users={organizationUsers}
      loading={organizationUserStatus === 'loading'}
      importEnabled={true}
      hasMoreUsers={hasMoreUsers}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMoreUsers}
      totalUsers={totalUsers}
      refresh={refresh}
    />
  );
}
