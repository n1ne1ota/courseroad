import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { DashboardShellSkeleton } from '@/features/dashboard/shared/shell/dashboard-shell-skeleton';
import { requireAuth } from '@/server/auth/require-auth';

async function LearnerGuard({ children }: { children: ReactNode }) {
  await requireAuth();
  return <>{children}</>;
}

export default function LearnerRootLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <LearnerGuard>{children}</LearnerGuard>
    </Suspense>
  );
}
