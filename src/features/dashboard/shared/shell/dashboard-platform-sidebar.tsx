'use client';

import type { ComponentProps } from 'react';

import { Sidebar, SidebarContent, SidebarFooter } from '@courseroad/kurume-ui/dashboard';

import type { DashboardData } from '@/types/data.types';

import { DashboardNavDocuments } from './dashboard-nav-documents';
import { DashboardNavMain } from './dashboard-nav-main';
import { DashboardNavSecondary } from './dashboard-nav-secondary';
import { DashboardNavUser } from './dashboard-nav-user';

interface DashboardSidebarProps extends ComponentProps<typeof Sidebar> {
  dashboardData: DashboardData;
}

export function DashboardPlatformSidebar({ dashboardData, ...props }: DashboardSidebarProps) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
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
