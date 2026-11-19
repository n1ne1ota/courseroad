'use client';

import { useEffect } from 'react';

import { markAnnouncementRead } from '../../actions/announcement-actions';

/**
 * Records that the announcement was opened. Done from the browser after it shows, not while the page renders: a
 * prefetch or a link preview must not count as reading it. Repeating it is a no-op on the server.
 */
export function MarkRead({ announcementId, alreadyRead }: { alreadyRead: boolean; announcementId: string }) {
  useEffect(() => {
    if (!alreadyRead) void markAnnouncementRead({ announcementId });
  }, [alreadyRead, announcementId]);

  return null;
}
