import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { DashboardShellSkeleton } from '@/features/dashboard/shared/shell/dashboard-shell-skeleton';
import { requireRole } from '@/server/auth/require-role';

async function AdminGuard({ children }: { children: ReactNode }) {
  await requireRole('ADMIN');
  return <>{children}</>;
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AdminGuard>{children}</AdminGuard>
    </Suspense>
  );
}
