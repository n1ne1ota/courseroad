import { Suspense } from 'react';

import { AnnouncementFeedSkeleton } from '@/features/blog/components/announcements/announcement-skeletons';
import { LearnerFeedView } from '@/features/blog/components/announcements/announcement-views';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { readForPage } from '@/server/auth/page-access';

type PageProps = { params: Promise<{ slug: string }> };

async function OrganizationFeed({ params }: PageProps) {
  const { slug } = await params;
  const { organization } = await readForPage(() => getOrganizationContext(slug, 'learner'));
  return <LearnerFeedView organization={{ id: organization.id, slug: organization.slug }} />;
}

export default function OrganizationLearnerAnnouncementsPage({ params }: PageProps) {
  return (
    <DashboardOrganizationLayout role='learner' title='Announcements'>
      <Suspense fallback={<AnnouncementFeedSkeleton />}>
        <OrganizationFeed params={params} />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
