import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { cn } from '@/lib/utils/cn';

import { courseGridClass, glassCardClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';

/** Skeleton for `CertificateGrid`: award icon, two-line title, completion date, and the View button. */
export function CertificateGridSkeleton({ count = 4 }: { count?: number }): JSX.Element {
  return (
    <div className={courseGridClass}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn(glassCardClass, 'p-6')}>
          <Skeleton className='mb-4 size-12 rounded-2xl' />
          {/* Matches the real title's reserved two-line height. */}
          <div className='flex min-h-[3rem] flex-col gap-2'>
            <Skeleton className='h-4 w-5/6' shape='text' />
            <Skeleton className='h-4 w-2/3' shape='text' />
          </div>
          <Skeleton className='mt-2 h-3 w-40' shape='text' />
          <Skeleton className='mt-6 h-10 w-full rounded-xl' />
        </div>
      ))}
    </div>
  );
}
