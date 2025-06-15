import { generateMockUsers } from '@/constants/mockUsers';
import { useSelectedAgentUsersEffect } from '@/hooks/use-agent-effect';
import React from 'react';

import { AnimatedLoadingSmall } from '../animated-components/animated-loading-small';
import { UsersTable } from '../app-users/app-users-table';
import { PrimaryButton } from '../buttons/primary-button';

export function AgentUsers() {
  const { agentUsers, agentUserStatus } = useSelectedAgentUsersEffect();
  const [viewDemo, setViewDemo] = React.useState(false);

  const users = viewDemo ? generateMockUsers(100) : agentUsers;
  return (
    <React.Fragment>
      {agentUserStatus === 'loading' ? (
        <AnimatedLoadingSmall />
      ) : (
        <React.Fragment>
          <div className="flex items-center justify-between border-b p-3">
            <span className="text-sm text-muted-foreground">There are {users.length} users</span>
            <PrimaryButton onClick={() => setViewDemo(true)}>View demo</PrimaryButton>
          </div>
          <UsersTable users={users} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
