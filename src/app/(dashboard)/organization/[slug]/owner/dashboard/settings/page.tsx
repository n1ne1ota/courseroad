import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';
import { SettingsView } from '@/features/dashboard/shared/views/settings-view';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RoleSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <DashboardOrganizationLayout title='Settings'>
      <Suspense fallback={<PageSkeleton />}>
        <SettingsView orgSlug={slug} />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
