'use client';

import { Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for Course Card
 */
export function CourseCardSkeleton() {
  return (
    <div className='bg-content1 overflow-hidden rounded-xl border'>
      <Skeleton className='aspect-video w-full' />
      <div className='space-y-2 p-4'>
        <Skeleton className='h-5 w-3/4 rounded-lg' />
        <Skeleton className='h-4 w-1/2 rounded-lg' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-6 rounded-full' />
          <Skeleton className='h-4 w-24 rounded-lg' />
        </div>
      </div>
    </div>
  );
}
