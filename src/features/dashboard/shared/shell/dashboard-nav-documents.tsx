'use client';

import Link from 'next/link';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@courseroad/kurume-ui';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@courseroad/kurume-ui/dashboard';

import { FolderIcon, MoreHorizontalIcon, ShareIcon } from 'lucide-react';

import type { NavItems } from '@/types/data.types';

export function DashboardNavDocuments({ items }: { items: NavItems[] }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton render={<Link href={item.url} />}>
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuAction className='rounded-sm data-[popup-open]:bg-accent' showOnHover />}
              >
                <MoreHorizontalIcon />
                <span className='sr-only'>More</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-24 rounded-lg'

                positionerProps={{ align: isMobile ? 'end' : 'start', side: isMobile ? 'bottom' : 'right' }}
              >
                <DropdownMenuItem>
                  <FolderIcon />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShareIcon />
                  <span>Share</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className='text-sidebar-foreground/70'>
            <MoreHorizontalIcon className='text-sidebar-foreground/70' />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
