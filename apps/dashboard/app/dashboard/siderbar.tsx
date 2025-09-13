'use client';

import { NavMain } from '@/components/navigations/nav-main';
import { NavUser } from '@/components/navigations/nav-user';
import { OnboardingTasks } from '@/components/onboarding/onboarding-tasks';
import { OrganizationSwitcher } from '@/components/organizations/organization-switcher';
import { IconContainer } from '@/components/ui/icon-container';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useDashboardDataQueries } from '@/hooks/use-dashboard-queries';
import { cn } from '@/lib/utils';
import {
  BotIcon,
  CheckCircle,
  FileStackIcon,
  HomeIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import * as React from 'react';

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
  // {
  //   title: 'Workflows',
  //   url: '/dashboard/workflows',
  //   icon: (selected: boolean) => (
  //     <NavigationIcon icon={<WorkflowIcon className="h-3 w-3" />} selected={selected} />
  //   ),
  // },
  {
    title: 'Resources',
    url: '/dashboard/resources',
    icon: (selected: boolean) => (
      <NavigationIcon icon={<FileStackIcon className="h-3 w-3" />} selected={selected} />
    ),
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: (selected: boolean) => (
      <NavigationIcon icon={<SettingsIcon className="h-3 w-3" />} selected={selected} />
    ),
  },
];
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { selectedOrganization } = useDashboardState();
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);

  // Get data to check onboarding progress
  const {
    data: { agents, resources, users },
  } = useDashboardDataQueries(selectedOrganization?.id);

  const hasAgents = agents.length > 0;
  const hasResources = resources.length > 0;
  const hasUsers = users.length > 0;
  const completedTasks = (hasAgents ? 1 : 0) + (hasResources ? 1 : 0) + (hasUsers ? 1 : 0);
  const totalTasks = 3;
  const isOnboardingComplete = completedTasks === totalTasks;

  // Add onboarding to the navigation items
  const navigationItems = [
    ...navigations,
    {
      title: 'Getting Started',
      url: '#',
      icon: (selected: boolean) => (
        <div className="relative">
          <NavigationIcon
            icon={
              <CheckCircle className={cn('h-3 w-3', isOnboardingComplete && 'text-green-500')} />
            }
            selected={selected}
          />
          {!isOnboardingComplete && (
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></div>
          )}
        </div>
      ),
      onClick: () => setIsOnboardingOpen(true),
    },
  ];

  return (
    <>
      <Sidebar
        variant="inset"
        collapsible="none"
        className="h-screen border-r bg-gray-50 pt-2"
        {...props}>
        <SidebarHeader>
          <OrganizationSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <NavMain
            items={navigationItems.map((item, index) => {
              const isActive =
                index === 0 ? pathname === item.url : pathname.includes(`${item.url}`);
              return {
                ...item,
                icon: item.icon(isActive),
                isActive,
              };
            })}
          />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <OnboardingTasks
        open={isOnboardingOpen}
        onOpenChange={setIsOnboardingOpen}
        hasAgents={hasAgents}
        hasResources={hasResources}
        hasUsers={hasUsers}
      />
    </>
  );
}
