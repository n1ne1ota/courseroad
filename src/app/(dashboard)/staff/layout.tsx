import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { DashboardShellSkeleton } from '@/features/dashboard/shared/shell/dashboard-shell-skeleton';
import { requireRole } from '@/server/auth/require-role';

async function StaffGuard({ children }: { children: ReactNode }) {
  await requireRole('STAFF');
  return <>{children}</>;
}

export default function StaffRootLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <StaffGuard>{children}</StaffGuard>
    </Suspense>
  );
}
