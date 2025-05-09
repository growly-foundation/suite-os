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

export const UserButton = () => {
  const { logout } = usePrivy();
  const { admin: user } = useDashboardState();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 border-2 border-white/20 cursor-pointer">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.name || ''} />
          <AvatarFallback className="bg-white/10 text-white">
            {user?.name?.split(' ')[0].charAt(0)}
          </AvatarFallback>
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
