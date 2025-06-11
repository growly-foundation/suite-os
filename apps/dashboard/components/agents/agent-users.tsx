import { PaddingLayout } from '@/app/dashboard/layout';

import { UsersTable } from '../app-users/app-users-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function AgentUsers() {
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
          <UsersTable />
        </CardContent>
      </Card>
    </PaddingLayout>
  );
}
