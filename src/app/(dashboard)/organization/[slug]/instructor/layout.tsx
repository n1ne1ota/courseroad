import 'server-only';

import { Suspense } from 'react';

import type { Route } from 'next';

import { DashboardShellSkeleton } from '@/features/dashboard/shared/shell/dashboard-shell-skeleton';
import { requireOrgRole } from '@/server/auth/require-org-role';

type InstructorLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default function InstructorLayout(props: InstructorLayoutProps) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthorizedInstructorLayout {...props} />
    </Suspense>
  );
}

async function AuthorizedInstructorLayout({ children, params }: InstructorLayoutProps) {
  const { slug } = await params;
  await requireOrgRole('instructor', `/organization/${slug}/learner/dashboard` as Route, slug);
  return <>{children}</>;
}
