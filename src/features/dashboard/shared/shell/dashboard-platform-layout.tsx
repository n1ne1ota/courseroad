'use client';

import type { ReactNode } from 'react';

import * as dashboard from '@courseroad/kurume-ui/dashboard';

import type { PlatformDashboardRole } from '@/lib/config/data';
import { platformDashboardData } from '@/lib/config/data';

import { Breadcrumbs } from '../ui/breadcrumbs';
import { dashboardPageClass } from '../ui/dashboard-page-shell';
import { DashboardPlatformSidebar } from './dashboard-platform-sidebar';

type DashboardLayoutProps = {
  title?: string | undefined;
  actions?: ReactNode;
  children: ReactNode;
  role?: PlatformDashboardRole;
};

export function DashboardPlatformLayout({ actions, children, role = 'learner', title }: DashboardLayoutProps) {
  const dashboardData = platformDashboardData(role);

  return (
    <dashboard.DashboardLayout
      actions={actions}
      breadcrumbs={<Breadcrumbs />}
      sidebar={<DashboardPlatformSidebar dashboardData={dashboardData} role={role} variant='inset' />}
      title={title}
    >
      <div className={dashboardPageClass}>{children}</div>
    </dashboard.DashboardLayout>
  );
}
