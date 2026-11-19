import type { Metadata } from 'next';

import { ChangelogView } from '@/features/blog/components/changelog-view';

export default function ChangelogPage() {
  return <ChangelogView />;
}

export const metadata: Metadata = {
  alternates: { canonical: '/changelog', types: { 'application/rss+xml': '/changelog/rss.xml' } },
  description: 'What is new in Courseroad, for learners, creators and organizations.',
  title: 'Changelog'
};
