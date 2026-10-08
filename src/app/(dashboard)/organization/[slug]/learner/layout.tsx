import 'server-only';

import type { Route } from 'next';

import { requireOrgRole } from '@/server/auth/require-org-role';

type LearnerLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function LearnerLayout({ children, params }: LearnerLayoutProps) {
  const { slug } = await params;
  await requireOrgRole('learner', `/organization/${slug}/learner/dashboard` as Route, slug);
  return <>{children}</>;
}
