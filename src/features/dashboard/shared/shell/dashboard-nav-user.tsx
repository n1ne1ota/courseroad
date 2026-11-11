'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Avatar } from '@courseroad/iota-ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@courseroad/kurume-ui';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@courseroad/kurume-ui/dashboard';
import {
  HelpCircleIcon,
  HomeIcon,
  LayoutDashboardIcon,
  ListIcon,
  LogOutIcon,
  MoreVerticalIcon,
  SettingsIcon
} from 'lucide-react';

import { authClient, signOutUser } from '@/lib/auth/auth-client';
import { routes } from '@/lib/routes';
import { createOrgRoutes, extractOrgSlug, getActiveRoleFromPath } from '@/lib/routes/org';

export function DashboardNavUser() {
  const { isMobile } = useSidebar();
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();

  const orgSlug = extractOrgSlug(pathname);
  const activeRole = getActiveRoleFromPath(pathname) ?? 'learner';
  const orgRoutes = orgSlug ? createOrgRoutes(orgSlug, activeRole) : null;

  const dashboardUrl = orgRoutes ? orgRoutes.dashboard : routes.selectOrganization;
  const coursesUrl = orgRoutes ? orgRoutes.courses : routes.selectOrganization;
  const settingsUrl = orgRoutes ? orgRoutes.settings : routes.selectOrganization;

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg'>
            <div className='h-8 w-8 animate-pulse rounded-lg bg-muted' />
            <div className='grid flex-1 gap-1'>
              <div className='h-4 w-24 animate-pulse rounded bg-muted' />
              <div className='h-3 w-32 animate-pulse rounded bg-muted' />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              size='lg'
            >
              <Avatar
                className='h-8 w-8 rounded-lg'
                name={session?.user.name}
                email={session?.user.email}
                image={session?.user.image}
                size={32}
              />
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>
                  {session?.user.name && session.user.name.length > 0
                    ? session.user.name
                    : session?.user.email.split('@')[0]}
                </span>
                <span className='truncate text-xs text-muted-foreground'>{session?.user.email}</span>
              </div>
              <MoreVerticalIcon className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='end'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar
                  className='h-8 w-8 rounded-lg'
                  name={session?.user.name}
                  email={session?.user.email}
                  image={session?.user.image}
                  size={32}
                />
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>
                    {session?.user.name && session.user.name.length > 0
                      ? session.user.name
                      : session?.user.email.split('@')[0]}
                  </span>
                  <span className='truncate text-xs text-muted-foreground'>{session?.user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={routes.home}>
                  <HomeIcon />
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={dashboardUrl as Route}>
                  <LayoutDashboardIcon />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={coursesUrl as Route}>
                  <ListIcon className='size-4' />
                  Courses
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={settingsUrl as Route}>
                  <SettingsIcon className='size-4' />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='#'>
                  <HelpCircleIcon className='size-4' />
                  Get Help
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOutUser}>
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
