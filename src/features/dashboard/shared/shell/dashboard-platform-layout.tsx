'use client';

import type { ReactNode } from 'react';

import * as dashboard from '@courseroad/kurume-ui/dashboard';

import { adminDashboardData, orgDashboardData, staffDashboardData } from '@/lib/config/data';

import { Breadcrumbs } from '../ui/breadcrumbs';
import { DashboardPlatformSidebar } from './dashboard-platform-sidebar';

type DashboardLayoutProps = {
  title?: string | undefined;
  actions?: ReactNode;
  children: ReactNode;
  role?: 'admin' | 'staff' | 'learner' | 'creator';
};

export function DashboardPlatformLayout({ actions, children, role = 'learner', title }: DashboardLayoutProps) {
  const dashboardData =
    role === 'admin' ? adminDashboardData : role === 'staff' ? staffDashboardData : orgDashboardData(undefined, role);

  return (
    <dashboard.DashboardLayout
      actions={actions}
      breadcrumbs={<Breadcrumbs />}
      sidebar={<DashboardPlatformSidebar dashboardData={dashboardData} variant='inset' />}
      title={title}
    >
      {children}
    </dashboard.DashboardLayout>
  );
}
