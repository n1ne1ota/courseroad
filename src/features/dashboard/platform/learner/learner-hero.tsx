import type { JSX } from 'react';

import { loadLearnerHero } from '@/features/course/server/loaders/platform-learner';
import { LearnerHeroFrame } from '@/features/dashboard/shared/ui/learner-hero-frame';
import { readForPage } from '@/server/auth/page-access';

/** Personalized greeting; suspends on the learner's name and in-progress count. */
export async function LearnerHero(): Promise<JSX.Element> {
  const { firstName, inProgressCount } = await readForPage(() => loadLearnerHero());

  return (
    <LearnerHeroFrame>
      <h2 className='text-3xl font-extrabold tracking-tight text-foreground md:text-4xl'>
        Welcome back,{' '}
        <span className='bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent'>
          {firstName || 'Learner'}
        </span>
        !
      </h2>
      <p className='mt-2 max-w-xl text-lg text-muted-foreground'>
        Ready to learn? You have <span className='font-semibold text-foreground'>{inProgressCount} courses</span>{' '}
        currently in progress.
      </p>
    </LearnerHeroFrame>
  );
}
