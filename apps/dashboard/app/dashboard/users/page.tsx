import { PaddingLayout } from '@/app/dashboard/layout';
import { UsersTable } from '@/components/app-users/app-users-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growly Suite Dashboard | Users',
  description: 'Manage your users and their onchain persona.',
};

export default function UsersPage() {
  return (
    <PaddingLayout>
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
          <UsersTable />
        </CardContent>
      </Card>
    </PaddingLayout>
  );
}
