import { Suspense } from 'react';

import { LearnerCoursesView } from '@/features/dashboard/organization/learner/courses/courses-page';
import { LearnerCoursesViewSkeleton } from '@/features/dashboard/organization/learner/courses/courses-page-skeleton';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

export default async function LearnerCoursesPage() {
  return (
    <DashboardOrganizationLayout role='learner' title='My Courses'>
      <Suspense fallback={<LearnerCoursesViewSkeleton />}>
        <LearnerCoursesView />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
