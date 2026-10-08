import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { LearnerCoursesView } from '@/features/dashboard/organization/learner/courses/courses-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

export default async function LearnerCoursesPage() {
  return (
    <DashboardOrganizationLayout role='learner' title='My Courses'>
      <Suspense fallback={<PageSkeleton />}>
        <LearnerCoursesView />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
