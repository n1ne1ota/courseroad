import { Suspense } from 'react';

import { UnreadAnnouncementsCard } from '@/features/blog/components/announcements/announcement-views';
import { LearnerDashboardPage as LearnerDashboardContent } from '@/features/dashboard/organization/learner/dashboard/dashboard-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { readForPage } from '@/server/auth/page-access';

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function UnreadAnnouncements({ params }: PageProps) {
  const { slug } = await params;
  const { organization } = await readForPage(() => getOrganizationContext(slug, 'learner'));
  return <UnreadAnnouncementsCard organization={{ id: organization.id, slug: organization.slug }} />;
}

export default async function LearnerDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <DashboardOrganizationLayout role='learner' title='My Dashboard'>
      <div className='flex flex-col gap-6'>
        <Suspense fallback={null}>
          <UnreadAnnouncements params={params} />
        </Suspense>
        <LearnerDashboardContent orgSlug={slug} />
      </div>
    </DashboardOrganizationLayout>
  );
}
