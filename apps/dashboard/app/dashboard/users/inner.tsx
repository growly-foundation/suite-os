'use client';

import { AnimatedLoadingSmall } from '@/components/animated-components/animated-loading-small';
import { UsersTable } from '@/components/app-users/app-users-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSelectedOrganizationUsersEffect } from '@/hooks/use-organization-effect';
import { Search } from 'lucide-react';
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
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ENS or address"
                  className="pl-8 text-sm border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <UsersTable users={filteredUsers} />
          </React.Fragment>
        )}
      </CardContent>
    </Card>
  );
}
