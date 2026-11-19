import { Suspense } from 'react';

import { AnnouncementFeedSkeleton } from '@/features/blog/components/announcements/announcement-skeletons';
import { ManageAnnouncementsView } from '@/features/blog/components/announcements/announcement-views';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { readForPage } from '@/server/auth/page-access';

type PageProps = { params: Promise<{ slug: string }> };

async function ManageOrganizationAnnouncements({ params }: PageProps) {
  const { slug } = await params;
  const { organization } = await readForPage(() => getOrganizationContext(slug, 'manager'));
  return (
    <ManageAnnouncementsView
      description={`Post to every member of ${organization.name}.`}
      target={{ organizationId: organization.id, scope: 'Organization' }}
      title='Announcements'
    />
  );
}

export default function OrganizationOwnerAnnouncementsPage({ params }: PageProps) {
  return (
    <DashboardOrganizationLayout role='owner' title='Announcements'>
      <Suspense fallback={<AnnouncementFeedSkeleton />}>
        <ManageOrganizationAnnouncements params={params} />
      </Suspense>
    </DashboardOrganizationLayout>
  );
}
