import { UsersTable } from '@/components/app-users/app-users-table';
import { NewUserButton } from '@/components/app-users/new-user-button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users',
  description: 'Manage your users and their permissions.',
};

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <div className="flex items-center space-x-2">
          <NewUserButton />
        </div>
      </div>
      <UsersTable />
    </div>
  );
}
