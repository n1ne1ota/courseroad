import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { LearnerDashboardPage as LearnerDashboardContent } from '@/features/dashboard/organization/learner/dashboard/dashboard-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LearnerDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <DashboardOrganizationLayout role='learner' title='My Dashboard'>
      <Suspense fallback={<PageSkeleton />}>
        <LearnerDashboardContent orgSlug={slug} />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
