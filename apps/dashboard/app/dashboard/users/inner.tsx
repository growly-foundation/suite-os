'use client';

import { AnimatedLoadingSmall } from '@/components/animated-components/animated-loading-small';
import { ImportUserButton } from '@/components/app-users/integrations/import-user-button';
import { UsersTable } from '@/components/app-users/smart-tables/app-users-table';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { consumePersona } from '@/core/persona';
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
}: {
  users: ParsedUser[];
  loading: boolean;
  importEnabled: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter users
  // TODO: Improve with fuzzy search
  const filteredUsers = users.filter(user => {
    const chainNameService = consumePersona(user).nameService();
    return (
      chainNameService?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chainNameService?.avatar?.toLowerCase().includes(searchQuery.toLowerCase())
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
      {loading ? (
        <AnimatedLoadingSmall />
      ) : (
        <React.Fragment>
          <UsersTable
            users={filteredUsers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setSelectedRows={setSelectedRows}
            selectedRows={selectedRows}
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
                      {deleting
                        ? 'Deleting...'
                        : `Delete ${Object.keys(selectedRows).length} users`}
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
      )}
    </React.Fragment>
  );
}

export function UsersInner() {
  const { organizationUsers, organizationUserStatus } = useSelectedOrganizationUsersEffect();
  return (
    <UserDirectoryLayout
      users={organizationUsers}
      loading={organizationUserStatus === 'loading'}
      importEnabled={true}
    />
  );
}
