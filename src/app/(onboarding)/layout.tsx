import 'server-only';

import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { loadOnboardingLayout } from '@/features/auth/server/loaders/layout';
import { OnboardingFlowSkeleton } from '@/features/onboarding/components/onboarding-flow-skeleton';
import { readForPage } from '@/server/auth/page-access';

async function OnboardingGuard({ children }: { children: ReactNode }) {
  await readForPage(loadOnboardingLayout);

  return <>{children}</>;
}

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className='relative min-h-screen'>
      {/* Shared Background Grid */}
      <div className='fixed inset-0 overflow-hidden bg-background'>
        <div
          className='absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:48px_48px] bg-center opacity-60 dark:opacity-40'
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)'
          }}
        />
      </div>

      {/* Content wrapper */}
      <div className='relative z-10 flex min-h-screen flex-col'>
        <Suspense fallback={<OnboardingFlowSkeleton />}>
          <OnboardingGuard>{children}</OnboardingGuard>
        </Suspense>
      </div>
    </div>
  );
}
