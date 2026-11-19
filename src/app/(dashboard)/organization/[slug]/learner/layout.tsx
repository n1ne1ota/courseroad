import 'server-only';

import { Suspense } from 'react';

import type { Route } from 'next';

import { DashboardShellSkeleton } from '@/features/dashboard/shared/shell/dashboard-shell-skeleton';
import { requireOrgRole } from '@/server/auth/require-org-role';

type LearnerLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default function LearnerLayout(props: LearnerLayoutProps) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthorizedLearnerLayout {...props} />
    </Suspense>
  );
}

async function AuthorizedLearnerLayout({ children, params }: LearnerLayoutProps) {
  const { slug } = await params;
  await requireOrgRole('learner', `/organization/${slug}/learner/dashboard` as Route, slug);
  return <>{children}</>;
}
