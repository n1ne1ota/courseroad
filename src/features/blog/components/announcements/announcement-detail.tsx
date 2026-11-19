import Link from 'next/link';

import { Avatar, Chip } from '@courseroad/iota-ui';
import { HtmlContent } from '@courseroad/iota-ui/editor';

import { formatAnnouncementDate } from '../../lib/announcement-format';
import { MarkRead } from './mark-read';

import type { AnnouncementDetail as AnnouncementDetailData } from '../../types/announcement-types';

/** One announcement. The body was sanitized by the query that loaded it. */
export function AnnouncementDetail({
  announcement,
  backHref
}: {
  announcement: AnnouncementDetailData;
  backHref: string;
}) {
  const from = announcement.courseTitle ?? announcement.organizationName ?? 'Courseroad';

  return (
    <article className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      <Link className='text-sm text-muted-foreground hover:text-foreground' href={backHref as never}>
        &larr; All announcements
      </Link>
      <header className='flex flex-col gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <Chip color={announcement.scope === 'Course' ? 'brand' : 'default'} size='sm' variant='flat'>
            {announcement.scope === 'Course' ? 'Course' : 'Organization'}
          </Chip>
          <span className='text-sm text-muted-foreground'>{from}</span>
        </div>
        <h1 className='text-3xl font-bold tracking-tight'>{announcement.title}</h1>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Avatar name={announcement.authorName} size='sm' />
          <span>{announcement.authorName ?? 'Courseroad'}</span>
          <span aria-hidden>·</span>
          <time dateTime={announcement.publishedAt ?? undefined}>
            {formatAnnouncementDate(announcement.publishedAt)}
          </time>
        </div>
      </header>
      <HtmlContent html={announcement.bodyHtml} />
      <MarkRead alreadyRead={announcement.read} announcementId={announcement.id} />
    </article>
  );
}
