import Link from 'next/link';

import { Avatar, Card, Chip } from '@courseroad/iota-ui';

import { formatAnnouncementDate } from '../../lib/announcement-format';

import type { AnnouncementSummary } from '../../types/announcement-types';

/** One announcement in the feed: where it is from, who wrote it, when, and the start of the message. */
export function AnnouncementCard({ announcement, href }: { announcement: AnnouncementSummary; href: string }) {
  const from = announcement.courseTitle ?? announcement.organizationName ?? 'Courseroad';

  return (
    <Card className='relative flex flex-col gap-3 p-5'>
      <div className='flex flex-wrap items-center gap-2'>
        <Chip color={announcement.scope === 'Course' ? 'brand' : 'default'} size='sm' variant='flat'>
          {announcement.scope === 'Course' ? 'Course' : 'Organization'}
        </Chip>
        {announcement.pinned ? (
          <Chip color='warning' size='sm' variant='flat'>
            Pinned
          </Chip>
        ) : null}
        {announcement.read ? null : (
          <Chip color='brand' size='sm' variant='solid'>
            New
          </Chip>
        )}
        <span className='text-sm text-muted-foreground'>{from}</span>
      </div>
      <h2 className='text-lg font-semibold tracking-tight'>
        {/* Stretched link: the whole card opens the announcement. */}
        <Link className='after:absolute after:inset-0 after:content-[""]' href={href as never}>
          {announcement.title}
        </Link>
      </h2>
      {announcement.excerpt ? <p className='text-sm text-muted-foreground'>{announcement.excerpt}</p> : null}
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Avatar name={announcement.authorName} size='sm' />
        <span>{announcement.authorName ?? 'Courseroad'}</span>
        <span aria-hidden>·</span>
        <time dateTime={announcement.publishedAt ?? undefined}>{formatAnnouncementDate(announcement.publishedAt)}</time>
      </div>
    </Card>
  );
}
