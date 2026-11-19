import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { cn } from '@/lib/utils/cn';

import { listCardClass, listCardGridClass } from './dashboard-surfaces';

/** Skeleton for a content panel of plain list cards (creator courses and quizzes): title, two description lines. */
export function ListCardGridSkeleton({ count = 6 }: { count?: number }): JSX.Element {
  return (
    <div className={listCardGridClass}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn(listCardClass, 'h-full')}>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-5 w-3/5' shape='text' />
            <Skeleton className='mt-1 h-4 w-full' shape='text' />
            <Skeleton className='h-4 w-4/5' shape='text' />
          </div>
          {/* Reserves the hover-only "Edit →" row so the card height matches. */}
          <div className='mt-4 h-5' />
        </div>
      ))}
    </div>
  );
}
