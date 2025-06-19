'use client';

import { AnimatedLoadingSmall } from '@/components/animated-components/animated-loading-small';
import { UsersTable } from '@/components/app-users/app-users-table';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { SearchInput } from '@/components/inputs/search-input';
import { generateMockUsers } from '@/constants/mockUsers';
import { consumePersona } from '@/core/persona';
import { useSelectedOrganizationUsersEffect } from '@/hooks/use-organization-effect';
import React, { useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

export function UserDirectoryLayout({ users, loading }: { users: ParsedUser[]; loading: boolean }) {
  const [viewDemo, setViewDemo] = useState(false);
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

  const _users = viewDemo ? generateMockUsers(100) : filteredUsers;
  return (
    <React.Fragment>
      {loading ? (
        <AnimatedLoadingSmall />
      ) : (
        <React.Fragment>
          <div className="flex items-center justify-between border-b p-2 px-4">
            <span className="text-sm text-muted-foreground">There are {_users.length} users</span>
            <div className="flex items-center gap-2">
              <SearchInput
                className="p-2"
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                placeholder="Search ENS or address"
              />
              <PrimaryButton onClick={() => setViewDemo(true)}>View demo</PrimaryButton>
            </div>
          </div>
          <UsersTable users={_users} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export function UsersInner() {
  const { organizationUsers, organizationUserStatus } = useSelectedOrganizationUsersEffect();
  return (
    <UserDirectoryLayout users={organizationUsers} loading={organizationUserStatus === 'loading'} />
  );
}
