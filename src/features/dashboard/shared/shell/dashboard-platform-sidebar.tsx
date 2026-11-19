'use client';

import type { ComponentProps } from 'react';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@courseroad/kurume-ui/dashboard';

import type { PlatformDashboardRole } from '@/lib/config/data';

import type { DashboardData } from '@/types/data.types';

import { DashboardNavDocuments } from './dashboard-nav-documents';
import { DashboardNavMain } from './dashboard-nav-main';
import { DashboardNavSecondary } from './dashboard-nav-secondary';
import { DashboardNavUser } from './dashboard-nav-user';
import { DashboardPlatformHeader } from './dashboard-platform-header';

interface DashboardSidebarProps extends ComponentProps<typeof Sidebar> {
  dashboardData: DashboardData;
  role?: PlatformDashboardRole;
}

export function DashboardPlatformSidebar({ dashboardData, role, ...props }: DashboardSidebarProps) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <DashboardPlatformHeader role={role} />
      </SidebarHeader>
      <SidebarContent>
        <DashboardNavMain items={dashboardData.navMain} />
        <DashboardNavDocuments items={dashboardData.documents} />
        <DashboardNavSecondary className='mt-auto' items={dashboardData.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <DashboardNavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
