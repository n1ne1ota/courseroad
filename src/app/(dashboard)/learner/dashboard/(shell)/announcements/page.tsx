import { Suspense } from 'react';

import { AnnouncementFeedSkeleton } from '@/features/blog/components/announcements/announcement-skeletons';
import { LearnerFeedView } from '@/features/blog/components/announcements/announcement-views';

export default function LearnerAnnouncementsPage() {
  return (
    <Suspense fallback={<AnnouncementFeedSkeleton />}>
      <LearnerFeedView organization={null} />
    </Suspense>
  );
}
