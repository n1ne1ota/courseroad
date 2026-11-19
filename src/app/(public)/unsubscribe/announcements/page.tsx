import type { Metadata } from 'next';

import { UnsubscribeView } from '@/features/blog/components/unsubscribe-view';
import { isValidUnsubscribeToken } from '@/features/blog/server/loaders/announcements';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Unsubscribe from announcement emails'
};

export default async function UnsubscribeAnnouncementsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { status, token } = await searchParams;
  if (status === 'done') return <UnsubscribeView state='done' />;

  const value = typeof token === 'string' ? token : undefined;
  if (!value || !isValidUnsubscribeToken(value)) return <UnsubscribeView state='invalid' />;
  return <UnsubscribeView state='confirm' token={value} />;
}
