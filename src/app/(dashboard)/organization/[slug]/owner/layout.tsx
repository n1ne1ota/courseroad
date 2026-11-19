import 'server-only';

import { Suspense } from 'react';

import type { Route } from 'next';

import { DashboardShellSkeleton } from '@/features/dashboard/shared/shell/dashboard-shell-skeleton';
import { requireOrgRole } from '@/server/auth/require-org-role';

type OwnerLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default function OwnerLayout(props: OwnerLayoutProps) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthorizedOwnerLayout {...props} />
    </Suspense>
  );
}

async function AuthorizedOwnerLayout({ children, params }: OwnerLayoutProps) {
  const { slug } = await params;
  await requireOrgRole('owner', `/organization/${slug}/learner/dashboard` as Route, slug);
  return <>{children}</>;
}
