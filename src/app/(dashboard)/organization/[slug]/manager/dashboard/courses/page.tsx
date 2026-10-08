import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { CreatorCoursesView } from '@/features/dashboard/organization/creator/courses-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RoleCoursesPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <DashboardOrganizationLayout title='Courses'>
      <Suspense fallback={<PageSkeleton />}>
        <CreatorCoursesView orgSlug={slug} role='manager' />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
