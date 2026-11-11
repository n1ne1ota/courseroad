import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { CreatorQuizzesView } from '@/features/dashboard/organization/creator/quizzes-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RoleQuizzesPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <DashboardOrganizationLayout title='Quizzes'>
      <Suspense fallback={<PageSkeleton />}>
        <CreatorQuizzesView orgSlug={slug} role='instructor' />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
