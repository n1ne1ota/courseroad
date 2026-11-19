'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator
} from '@courseroad/kurume-ui';
import { SidebarNavUser } from '@courseroad/kurume-ui/dashboard';

import { HelpCircleIcon, HomeIcon, LayoutDashboardIcon, ListIcon, LogOutIcon, SettingsIcon } from 'lucide-react';

import { authClient, signOutUser } from '@/lib/auth/auth-client';
import { routes } from '@/lib/routes';
import { createOrgRoutes, extractOrgSlug, getActiveRoleFromPath } from '@/lib/routes/org';

export function DashboardNavUser() {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();

  const orgSlug = extractOrgSlug(pathname);
  const activeRole = getActiveRoleFromPath(pathname) ?? 'learner';
  const orgRoutes = orgSlug ? createOrgRoutes(orgSlug, activeRole) : null;

  const getPlatformUrls = () => {
    if (pathname.startsWith('/creator')) {
      return {
        courses: routes.creatorCourses,
        dashboard: routes.creatorDashboard,
        settings: routes.creatorSettings
      };
    }
    if (pathname.startsWith('/admin')) {
      return {
        courses: routes.courses,
        dashboard: routes.adminDashboard,
        settings: routes.adminSettings
      };
    }
    if (pathname.startsWith('/staff')) {
      return {
        courses: routes.staffCourses,
        dashboard: routes.staffDashboard,
        settings: routes.staffSettings
      };
    }
    return {
      courses: routes.courses,
      dashboard: routes.dashboard,
      settings: routes.dashboardBilling
    };
  };

  const platformUrls = getPlatformUrls();
  const dashboardUrl = orgRoutes ? orgRoutes.dashboard : platformUrls.dashboard;
  const coursesUrl = orgRoutes ? orgRoutes.courses : platformUrls.courses;
  const settingsUrl = orgRoutes ? orgRoutes.settings : platformUrls.settings;

  const user = session?.user
    ? {
        email: session.user.email,
        image: session.user.image,
        name: session.user.name
      }
    : null;

  return (
    <SidebarNavUser isLoading={isPending} user={user}>
      <DropdownMenuGroup>
        <DropdownMenuLinkItem closeOnClick render={<Link href={routes.home} />}>
          <HomeIcon />
          Home
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem closeOnClick render={<Link href={dashboardUrl as Route} />}>
          <LayoutDashboardIcon />
          Dashboard
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem closeOnClick render={<Link href={coursesUrl as Route} />}>
          <ListIcon className='size-4' />
          Courses
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem closeOnClick render={<Link href={settingsUrl as Route} />}>
          <SettingsIcon className='size-4' />
          Settings
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem closeOnClick render={<Link href='#' />}>
          <HelpCircleIcon className='size-4' />
          Get Help
        </DropdownMenuLinkItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={signOutUser}>
        <LogOutIcon />
        Sign out
      </DropdownMenuItem>
    </SidebarNavUser>
  );
}
