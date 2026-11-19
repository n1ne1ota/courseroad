import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card, Chip } from '@courseroad/iota-ui';

import { readForPage } from '@/server/auth/page-access';

import { announcementFeedPath } from '../../lib/announcement-routes';
import { announcementIdSchema, type AuthoringTarget, formatUnreadCount } from '../../schemas/announcement-schemas';
import {
  readAnnouncement,
  readAuthoredList,
  readEmailAudience,
  readEmailPreference,
  readFeed,
  readUnreadCount
} from '../../server/loaders/announcements';
import { AnnouncementDetail } from './announcement-detail';
import { AnnouncementFeed } from './announcement-feed';
import { AnnouncementManager } from './announcement-manager';

/** The learner's feed, for the platform (`organization` is `null`) or one organization. */
export async function LearnerFeedView({ organization }: { organization: { id: string; slug: string } | null }) {
  const organizationId = organization?.id ?? null;
  const [feed, unreadCount, emailEnabled] = await readForPage(() =>
    Promise.all([readFeed({ organizationId }), readUnreadCount(organizationId), readEmailPreference()])
  );

  return (
    <AnnouncementFeed
      emailEnabled={emailEnabled}
      initialCursor={feed.nextCursor}
      initialItems={feed.items}
      organizationId={organizationId}
      organizationSlug={organization?.slug ?? null}
      unreadCount={unreadCount}
    />
  );
}

/** One announcement for a learner. An id that is not a UUID, or that the user may not read, is a 404. */
export async function LearnerAnnouncementView({
  announcementId,
  organizationSlug
}: {
  announcementId: string;
  organizationSlug: string | null;
}) {
  if (!announcementIdSchema.safeParse({ announcementId }).success) notFound();
  const announcement = await readForPage(() => readAnnouncement(announcementId));
  return <AnnouncementDetail announcement={announcement} backHref={announcementFeedPath(organizationSlug)} />;
}

/** A card for the learner home: how many announcements are waiting, linking to the feed. */
export async function UnreadAnnouncementsCard({ organization }: { organization: { id: string; slug: string } | null }) {
  const count = await readForPage(() => readUnreadCount(organization?.id ?? null));

  return (
    <Card className='p-5'>
      <Link
        className='flex items-center justify-between gap-4'
        href={announcementFeedPath(organization?.slug ?? null) as never}
      >
        <span className='font-medium'>Announcements</span>
        {count > 0 ? (
          <Chip color='brand' size='sm' variant='solid'>
            {formatUnreadCount(count)} unread
          </Chip>
        ) : (
          <span className='text-sm text-muted-foreground'>All caught up</span>
        )}
      </Link>
    </Card>
  );
}

/** The announcements an author manages for one course or organization, with the composer. */
export async function ManageAnnouncementsView({
  description,
  target,
  title
}: {
  description: string;
  target: AuthoringTarget;
  title: string;
}) {
  const [items, audience] = await readForPage(() => Promise.all([readAuthoredList(target), readEmailAudience(target)]));

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
        <p className='mt-1 text-muted-foreground'>{description}</p>
      </div>
      <AnnouncementManager audience={audience} items={items} target={target} />
    </div>
  );
}
