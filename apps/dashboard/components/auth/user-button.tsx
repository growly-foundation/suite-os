import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDashboardState } from '@/hooks/use-dashboard';
import { usePrivy } from '@privy-io/react-auth';
import { Loader, LogOut } from 'lucide-react';
import { redirect } from 'next/navigation';

import { AdminAvatar } from '@getgrowly/ui';

export const UserButton = () => {
  const { logout } = usePrivy();
  const { admin: user } = useDashboardState();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {user ? (
          <AdminAvatar email={user?.email || ''} size={35} />
        ) : (
          <Loader className="h-4 w-4 animate-spin" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="cursor-pointer hover:bg-accent">Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="cursor-pointer hover:bg-accent">Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel
          className="flex items-center gap-2 cursor-pointer hover:bg-accent"
          onClick={async () => {
            await logout();
            redirect('/auth');
          }}>
          Logout
          <LogOut className="h-4 w-4 ml-2" />
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
