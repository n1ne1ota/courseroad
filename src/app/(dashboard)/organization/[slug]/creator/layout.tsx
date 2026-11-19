import 'server-only';

import { Suspense } from 'react';

import type { Route } from 'next';

import { DashboardShellSkeleton } from '@/features/dashboard/shared/shell/dashboard-shell-skeleton';
import { requireOrgRole } from '@/server/auth/require-org-role';

type CreatorLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default function CreatorLayout(props: CreatorLayoutProps) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthorizedCreatorLayout {...props} />
    </Suspense>
  );
}

async function AuthorizedCreatorLayout({ children, params }: CreatorLayoutProps) {
  const { slug } = await params;
  await requireOrgRole('creator', `/organization/${slug}/learner/dashboard` as Route, slug);
  return <>{children}</>;
}
