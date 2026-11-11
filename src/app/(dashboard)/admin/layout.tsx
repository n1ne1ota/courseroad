import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { requireRole } from '@/server/auth/require-role';

async function AdminGuard({ children }: { children: ReactNode }) {
  await requireRole('ADMIN');
  return <>{children}</>;
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AdminGuard>{children}</AdminGuard>
    </Suspense>
  );
}
