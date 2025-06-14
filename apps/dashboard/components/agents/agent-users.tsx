import { PaddingLayout } from '@/app/dashboard/layout';
import { useSelectedAgentUsersEffect } from '@/hooks/use-agent-effect';

import { AnimatedLoadingSmall } from '../animated-components/animated-loading-small';
import { UsersTable } from '../app-users/app-users-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function AgentUsers() {
  const { agentUsers, agentUserStatus } = useSelectedAgentUsersEffect();
  return (
    <PaddingLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Agent Users</CardTitle>
            <CardDescription className="mt-1">
              List of users interacted with this agent
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {agentUserStatus === 'loading' ? (
            <AnimatedLoadingSmall />
          ) : (
            <UsersTable users={agentUsers} />
          )}
        </CardContent>
      </Card>
    </PaddingLayout>
  );
}
