import { Suspense } from 'react';

import { AnnouncementDetailSkeleton } from '@/features/blog/components/announcements/announcement-skeletons';
import { LearnerAnnouncementView } from '@/features/blog/components/announcements/announcement-views';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

type PageProps = { params: Promise<{ announcementId: string; slug: string }> };

async function Announcement({ params }: PageProps) {
  const { announcementId, slug } = await params;
  return <LearnerAnnouncementView announcementId={announcementId} organizationSlug={slug} />;
}

export default function OrganizationLearnerAnnouncementPage({ params }: PageProps) {
  return (
    <DashboardOrganizationLayout role='learner' title='Announcement'>
      <Suspense fallback={<AnnouncementDetailSkeleton />}>
        <Announcement params={params} />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
