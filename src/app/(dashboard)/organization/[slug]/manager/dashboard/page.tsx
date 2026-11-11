import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { CreatorDashboardView } from '@/features/dashboard/organization/creator/dashboard-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

export default async function RoleDashboardPage() {
  return (
    <DashboardOrganizationLayout title='Dashboard'>
      <Suspense fallback={<PageSkeleton />}>
        <CreatorDashboardView />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
