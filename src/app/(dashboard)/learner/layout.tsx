import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { requireAuth } from '@/server/auth/require-auth';

async function LearnerGuard({ children }: { children: ReactNode }) {
  await requireAuth();
  return <>{children}</>;
}

export default function LearnerRootLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LearnerGuard>{children}</LearnerGuard>
    </Suspense>
  );
}
