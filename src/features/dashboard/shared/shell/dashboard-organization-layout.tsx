'use client';

import type { ReactNode } from 'react';

import { usePathname } from 'next/navigation';

import { DashboardLayout } from '@courseroad/kurume-ui/dashboard';

import { organizationDashboardData } from '@/lib/config/data';
import type { OrgRole } from '@/lib/routes/org';
import { extractOrgSlug, getActiveRoleFromPath } from '@/lib/routes/org';

import { DashboardOrganizationSidebar } from '@/features/dashboard/shared/shell/dashboard-organization-sidebar';

import { Breadcrumbs } from '../ui/breadcrumbs';
import { dashboardPageClass } from '../ui/dashboard-page-shell';

type OrganizationDashboardLayoutProps = {
  title?: string | undefined;
  actions?: ReactNode;
  children: ReactNode;
  role?: OrgRole;
};

export function DashboardOrganizationLayout({ actions, children, role, title }: OrganizationDashboardLayoutProps) {
  const pathname = usePathname();
  const orgSlug = extractOrgSlug(pathname) ?? '';

  const userRole = role || getActiveRoleFromPath(pathname) || 'learner';
  const dashboardData = organizationDashboardData(orgSlug, userRole);

  return (
    <DashboardLayout
      actions={actions}
      breadcrumbs={<Breadcrumbs />}
      sidebar={<DashboardOrganizationSidebar dashboardData={dashboardData} variant='inset' />}
      title={title}
    >
      <div className={dashboardPageClass}>{children}</div>
    </DashboardLayout>
  );
}
