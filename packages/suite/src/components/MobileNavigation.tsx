'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { useSuiteSession } from '@/hooks/use-session';
import { cn } from '@/lib/utils';
import { Screen } from '@/types/screen';
import { Home, Settings } from 'lucide-react';
import type React from 'react';

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
  const { theme } = useTheme();
  const { setScreen, screen } = useSuiteSession();
  return (
    <div
      className="position-fixed gas-bottom-0 gas-left-0 gas-right-0 gas-w-full"
      style={{
        backgroundColor: theme.background.default,
        borderTopColor: theme.ui.border.default,
        borderTopWidth: 1,
      }}>
      <nav className="gas-mx-auto gas-flex gas-h-14 gas-max-w-md gas-items-center gas-justify-around gas-px-4">
        {navItems.map(item => {
          const isActive = item.screen === screen;
          const IconComponent = item.icon;
          return (
            <div
              key={item.screen}
              className={cn('gas-flex gas-flex-col gas-items-center gas-justify-center')}
              style={{
                color: isActive ? theme.brand.primary : theme.text.primary,
              }}
              onClick={() => setScreen(item.screen)}>
              <IconComponent className="gas-h-5 gas-w-5" />
              <span className="gas-font-family gas-mt-1 gas-text-xs">{item.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
