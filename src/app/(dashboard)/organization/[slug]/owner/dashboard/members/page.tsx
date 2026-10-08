import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';
import { MembersView } from '@/features/dashboard/shared/views/members-view';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RoleMembersPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <DashboardOrganizationLayout title='Members'>
      <Suspense fallback={<PageSkeleton />}>
        <MembersView orgSlug={slug} />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
