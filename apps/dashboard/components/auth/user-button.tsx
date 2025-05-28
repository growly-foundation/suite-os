import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { useDashboardState } from '@/hooks/use-dashboard';
import { usePrivy } from '@privy-io/react-auth';
import { redirect } from 'next/navigation';
import { getNumberFromStr } from '@/lib/utils';

export const UserButton = () => {
  const { logout } = usePrivy();
  const { admin: user } = useDashboardState();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 border-2 border-white/20 cursor-pointer">
          <AvatarImage
            src={`/agent-avatars/agent-avatar-${getNumberFromStr(user?.name || '', 7)}.webp`}
          />
          <AvatarFallback>{user?.name}</AvatarFallback>
        </Avatar>
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
