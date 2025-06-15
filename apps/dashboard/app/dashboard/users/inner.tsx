'use client';

import { AnimatedLoadingSmall } from '@/components/animated-components/animated-loading-small';
import { UsersTable } from '@/components/app-users/app-users-table';
import { SearchInput } from '@/components/inputs/search-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSelectedOrganizationUsersEffect } from '@/hooks/use-organization-effect';
import React, { useState } from 'react';

export function UsersInner() {
  const [searchQuery, setSearchQuery] = useState('');
  const { organizationUsers, organizationUserStatus } = useSelectedOrganizationUsersEffect();

  // Filter users
  const filteredUsers = organizationUsers.filter(
    user =>
      user.ensName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Users</CardTitle>
          <CardDescription className="mt-1">
            List of all users interacted with agents under the organization.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {organizationUserStatus === 'loading' ? (
          <AnimatedLoadingSmall />
        ) : (
          <React.Fragment>
            <SearchInput
              className="p-2"
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search ENS or address"
            />
            <UsersTable users={filteredUsers} />
          </React.Fragment>
        )}
      </CardContent>
    </Card>
  );
}
