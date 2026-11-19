import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { cn } from '@/lib/utils/cn';

import { courseGridClass, glassCardClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';

/** Skeleton for `PersonalCourseList`: thumbnail, title, spacer, progress label and bar. */
export function PersonalCourseListSkeleton({ count = 4 }: { count?: number }): JSX.Element {
  return (
    <div className={courseGridClass}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn(glassCardClass, 'h-full')}>
          <Skeleton className='aspect-video w-full rounded-none' />
          <div className='flex flex-1 flex-col p-5'>
            <Skeleton className='h-6 w-5/6' shape='text' />
            <div className='flex-1 py-4' />
            <div className='mt-auto space-y-3'>
              <Skeleton className='h-5 w-28' shape='text' />
              <Skeleton className='h-2 w-full rounded-full' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
