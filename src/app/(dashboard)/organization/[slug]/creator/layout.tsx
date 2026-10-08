import 'server-only';

import type { Route } from 'next';

import { requireOrgRole } from '@/server/auth/require-org-role';

type CreatorLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function CreatorLayout({ children, params }: CreatorLayoutProps) {
  const { slug } = await params;
  await requireOrgRole('creator', `/organization/${slug}/learner/dashboard` as Route, slug);
  return <>{children}</>;
}
