'use client';

import type { ComponentProps } from 'react';

import Link from 'next/link';

import { ThemeSwitch } from '@courseroad/iota-ui';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@courseroad/kurume-ui/dashboard';
import { useTheme } from 'next-themes';

import type { NavItems } from '@/types/data.types';

type DashboardNavSecondaryProps = {
  items: NavItems[];
} & ComponentProps<typeof SidebarGroup>;

export function DashboardNavSecondary({ items, ...props }: DashboardNavSecondaryProps) {
  const { setTheme, theme } = useTheme();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className='mb-1.5'>
          <p className='mb-1.5 px-0.5 text-xs text-sidebar-foreground/50'>Appearance</p>
          <ThemeSwitch className='w-full' theme={theme} onThemeChange={setTheme} />
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
