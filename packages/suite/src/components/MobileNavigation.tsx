'use client';

import type React from 'react';

import { Home, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Screen } from '@/types/screen';
import { useSuiteSession } from '@/hooks/use-session';

interface NavItem {
  icon: React.ElementType;
  screen: Screen;
  label: string;
}

const navItems: NavItem[] = [
  {
    icon: Home,
    screen: Screen.Chat,
    label: 'Chat',
  },
  {
    icon: Settings,
    screen: Screen.Settings,
    label: 'Settings',
  },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { setScreen } = useSuiteSession();
  return (
    <div className="position-fixed bottom-0 left-0 right-0 w-full border-t border-gray-200 bg-white">
      <nav className="mx-auto flex h-14 max-w-md items-center justify-around px-4">
        {navItems.map(item => {
          const isActive = pathname === item.screen;
          const IconComponent = item.icon;
          return (
            <div
              key={item.screen}
              className={cn(
                'flex flex-col items-center justify-center',
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
              )}
              onClick={() => setScreen(item.screen)}>
              <IconComponent className="h-5 w-5" />
              <span className="mt-1 text-xs">{item.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
