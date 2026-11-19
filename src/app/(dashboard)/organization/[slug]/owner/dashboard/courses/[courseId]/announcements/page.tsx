import { Suspense } from 'react';

import { AnnouncementFeedSkeleton } from '@/features/blog/components/announcements/announcement-skeletons';
import { ManageAnnouncementsView } from '@/features/blog/components/announcements/announcement-views';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

type PageProps = { params: Promise<{ courseId: string; slug: string }> };

async function ManageCourseAnnouncements({ params }: PageProps) {
  const { courseId } = await params;
  return (
    <ManageAnnouncementsView
      description='Post to the learners enrolled in this course.'
      target={{ courseId, scope: 'Course' }}
      title='Course announcements'
    />
  );
}

export default function OrganizationOwnerCourseAnnouncementsPage({ params }: PageProps) {
  return (
    <DashboardOrganizationLayout role='owner' title='Course announcements'>
      <Suspense fallback={<AnnouncementFeedSkeleton />}>
        <ManageCourseAnnouncements params={params} />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
