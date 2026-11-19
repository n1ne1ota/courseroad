'use client';

import { useState, useTransition } from 'react';

import { Button, Chip } from '@courseroad/iota-ui';

import { loadAnnouncementFeed } from '../../actions/announcement-actions';
import { announcementPath } from '../../lib/announcement-routes';
import { formatUnreadCount } from '../../schemas/announcement-schemas';
import { AnnouncementCard } from './announcement-card';
import { EmailPreferenceSwitch } from './email-preference-switch';

import type { AnnouncementSummary } from '../../types/announcement-types';

interface AnnouncementFeedProps {
  emailEnabled: boolean;
  initialCursor: string | null;
  initialItems: AnnouncementSummary[];
  /** `null` for the platform feed. */
  organizationId: string | null;
  organizationSlug: string | null;
  unreadCount: number;
}

/** The learner's feed: unread count and email switch up top, announcements below, more on request. */
export function AnnouncementFeed({
  emailEnabled,
  initialCursor,
  initialItems,
  organizationId,
  organizationSlug,
  unreadCount
}: AnnouncementFeedProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    if (!cursor) return;
    setError(null);
    startTransition(async () => {
      const result = await loadAnnouncementFeed({ cursor, organizationId });
      if (!result.success || !result.data) {
        setError(result.error ?? 'Could not load more announcements');
        return;
      }
      const page = result.data;
      setItems(current => [...current, ...page.items.filter(item => !current.some(known => known.id === item.id))]);
      setCursor(page.nextCursor);
    });
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <h1 className='text-3xl font-bold tracking-tight'>Announcements</h1>
          {unreadCount > 0 ? (
            <Chip color='brand' size='sm' variant='solid'>
              {formatUnreadCount(unreadCount)} unread
            </Chip>
          ) : null}
        </div>
        <EmailPreferenceSwitch initial={emailEnabled} />
      </div>

      {items.length === 0 ? (
        <p className='text-muted-foreground'>No announcements yet. They will show up here.</p>
      ) : (
        <ul className='flex flex-col gap-4'>
          {items.map(item => (
            <li key={item.id}>
              <AnnouncementCard announcement={item} href={announcementPath({ id: item.id, organizationSlug })} />
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p className='text-danger text-sm' role='alert'>
          {error}
        </p>
      ) : null}
      {cursor ? (
        <div>
          <Button type='button' disabled={pending} variant='secondary' onClick={loadMore}>
            {pending ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
