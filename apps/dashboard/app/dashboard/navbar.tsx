import { UserButton } from '@/components/auth/user-button';
import { OrganizationSwitcher } from '@/components/organizations/organization-switcher';
import { IconContainer } from '@/components/ui/icon-container';
import { cn } from '@/lib/utils';
import { BotIcon, FileStackIcon, HomeIcon, UserIcon, WorkflowIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SuiteLogo } from '@getgrowly/ui';

const NavigationIcon = ({ icon, selected }: { icon: React.ReactNode; selected: boolean }) => {
  return (
    <IconContainer
      className={cn('text-muted-foreground', selected && 'bg-blue-500 border-blue-500 text-white')}>
      {icon}
    </IconContainer>
  );
};

export const navigations = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: (selected: boolean) => (
      <NavigationIcon icon={<HomeIcon className="h-3 w-3" />} selected={selected} />
    ),
  },
  {
    title: 'Agents',
    url: '/dashboard/agents',
    icon: (selected: boolean) => (
      <NavigationIcon icon={<BotIcon className="h-3 w-3" />} selected={selected} />
    ),
  },
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: (selected: boolean) => (
      <NavigationIcon icon={<UserIcon className="h-3 w-3" />} selected={selected} />
    ),
  },
  {
    title: 'Workflows',
    url: '/dashboard/workflows',
    icon: (selected: boolean) => (
      <NavigationIcon icon={<WorkflowIcon className="h-3 w-3" />} selected={selected} />
    ),
  },
  {
    title: 'Resources',
    url: '/dashboard/resources',
    icon: (selected: boolean) => (
      <NavigationIcon icon={<FileStackIcon className="h-3 w-3" />} selected={selected} />
    ),
  },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b p-4 md:px-6 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-bold text-lg flex items-center">
            <SuiteLogo width={35} height={35} />
          </Link>
          <OrganizationSwitcher />
          <div className="flex gap-3">
            {navigations.map((item, index) => {
              const isActive =
                index === 0 ? pathname === item.url : pathname.includes(`${item.url}`);
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={cn('growly-nav-item', isActive && 'active')}>
                  {item.icon(isActive)}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <UserButton />
      </div>
    </header>
  );
}
