import { Suspense } from 'react';

import { AnnouncementDetailSkeleton } from '@/features/blog/components/announcements/announcement-skeletons';
import { LearnerAnnouncementView } from '@/features/blog/components/announcements/announcement-views';

type PageProps = { params: Promise<{ announcementId: string }> };

async function Announcement({ params }: PageProps) {
  const { announcementId } = await params;
  return <LearnerAnnouncementView announcementId={announcementId} organizationSlug={null} />;
}

export default function LearnerAnnouncementPage({ params }: PageProps) {
  return (
    <Suspense fallback={<AnnouncementDetailSkeleton />}>
      <Announcement params={params} />
    </Suspense>
  );
}
