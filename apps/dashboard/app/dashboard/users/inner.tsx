'use client';

import { AnimatedLoadingSmall } from '@/components/animated-components/animated-loading-small';
import { ImportUserButton } from '@/components/app-users/integrations/import-user-button';
import { UsersTable } from '@/components/app-users/smart-tables/app-users-table';
import { consumePersona } from '@/core/persona';
import { useSelectedOrganizationUsersEffect } from '@/hooks/use-organization-effect';
import React, { useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

export function UserDirectoryLayout({
  users,
  loading,
  importEnabled,
  onImportComplete,
}: {
  users: ParsedUser[];
  loading: boolean;
  importEnabled: boolean;
  onImportComplete?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users
  // TODO: Improve with fuzzy search
  const filteredUsers = users.filter(user => {
    const chainNameService = consumePersona(user).nameService();
    return (
      chainNameService?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chainNameService?.avatar?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <React.Fragment>
      {loading ? (
        <AnimatedLoadingSmall />
      ) : (
        <React.Fragment>
          <UsersTable
            users={filteredUsers}
            tableLabel={`There are ${filteredUsers.length} users`}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            additionalActions={
              importEnabled ? <ImportUserButton onImportComplete={onImportComplete} /> : undefined
            }
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export function UsersInner() {
  const { organizationUsers, organizationUserStatus, refresh } =
    useSelectedOrganizationUsersEffect();
  return (
    <UserDirectoryLayout
      users={organizationUsers}
      loading={organizationUserStatus === 'loading'}
      importEnabled={true}
      onImportComplete={refresh}
    />
  );
}
