import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { statCardClass, statsGridClass } from './dashboard-surfaces';

/** Skeleton for `LearnerDashboardStats`: three stat cards with an icon tile, label, and value. */
export function LearnerDashboardStatsSkeleton(): JSX.Element {
  return (
    <div className={statsGridClass}>
      {[0, 1, 2].map(i => (
        <div key={i} className={statCardClass}>
          <Skeleton className='size-14 shrink-0 rounded-2xl' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28' shape='text' />
            <Skeleton className='h-9 w-12' shape='text' />
          </div>
        </div>
      ))}
    </div>
  );
}
