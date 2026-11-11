'use client';

import type { ComponentProps } from 'react';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@courseroad/kurume-ui/dashboard';

import { OrgSwitcher } from '@/features/organization/org-switcher';

import type { DashboardData } from '@/types/data.types';

import { DashboardNavDocuments } from './dashboard-nav-documents';
import { DashboardNavMain } from './dashboard-nav-main';
import { DashboardNavSecondary } from './dashboard-nav-secondary';
import { DashboardNavUser } from './dashboard-nav-user';

interface OrgDashboardSidebarProps extends ComponentProps<typeof Sidebar> {
  dashboardData: DashboardData;
}

export function DashboardOrganizationSidebar({ dashboardData, ...props }: OrgDashboardSidebarProps) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <OrgSwitcher />
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
