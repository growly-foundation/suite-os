'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React from 'react';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: React.JSX.Element;
    isActive?: boolean;
    onClick?: () => void;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const router = useRouter();

  const handleItemClick = (item: (typeof items)[0]) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.url && item.url !== '#') {
      router.push(item.url);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                className={cn('growly-nav-item cursor-pointer', item.isActive && 'active')}
                onClick={() => handleItemClick(item)}>
                <div>
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
