import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { requireRole } from '@/server/auth/require-role';

async function StaffGuard({ children }: { children: ReactNode }) {
  await requireRole('STAFF');
  return <>{children}</>;
}

export default function StaffRootLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <StaffGuard>{children}</StaffGuard>
    </Suspense>
  );
}
