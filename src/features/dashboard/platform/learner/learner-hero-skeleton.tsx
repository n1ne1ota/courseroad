import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { LearnerHeroFrame } from '@/features/dashboard/shared/ui/learner-hero-frame';

/** Skeleton for the learner heroes: real frame and badge, placeholders for the greeting and count. */
export function LearnerHeroSkeleton(): JSX.Element {
  return (
    <LearnerHeroFrame>
      <Skeleton className='h-10 w-72 max-w-full md:h-11' shape='text' />
      <Skeleton className='mt-3 h-7 w-96 max-w-full' shape='text' />
    </LearnerHeroFrame>
  );
}
