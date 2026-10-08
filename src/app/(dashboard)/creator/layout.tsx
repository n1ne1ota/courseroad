import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { requireAuth } from '@/server/auth/require-auth';

async function CreatorGuard({ children }: { children: ReactNode }) {
  await requireAuth();
  return <>{children}</>;
}

export default function CreatorRootLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CreatorGuard>{children}</CreatorGuard>
    </Suspense>
  );
}
