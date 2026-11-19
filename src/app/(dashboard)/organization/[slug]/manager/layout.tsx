import 'server-only';

import { Suspense } from 'react';

import type { Route } from 'next';

import { DashboardShellSkeleton } from '@/features/dashboard/shared/shell/dashboard-shell-skeleton';
import { requireOrgRole } from '@/server/auth/require-org-role';

type ManagerLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default function ManagerLayout(props: ManagerLayoutProps) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthorizedManagerLayout {...props} />
    </Suspense>
  );
}

async function AuthorizedManagerLayout({ children, params }: ManagerLayoutProps) {
  const { slug } = await params;
  await requireOrgRole('manager', `/organization/${slug}/learner/dashboard` as Route, slug);
  return <>{children}</>;
}
