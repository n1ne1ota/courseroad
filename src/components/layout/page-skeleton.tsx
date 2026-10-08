'use client';

import { Skeleton } from '@courseroad/kurume-ui';

/**
 * Generic Page skeleton for landing/content pages
 */
export function PageSkeleton() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center p-8'>
      <div className='flex w-full max-w-4xl flex-col items-center justify-center space-y-8 text-center'>
        <div className='flex flex-col items-center space-y-4 text-center'>
          <Skeleton className='h-6 w-32' shape='text' />
          <Skeleton className='h-16 w-full max-w-2xl' />
          <Skeleton className='h-6 w-full max-w-3xl' shape='text' />
          <Skeleton className='h-6 w-3/4 max-w-xl' shape='text' />
        </div>
        <div className='flex justify-center gap-4'>
          <Skeleton className='h-12 w-32 rounded-full' />
          <Skeleton className='h-12 w-32 rounded-full' />
        </div>
        <div className='mt-16 grid w-full grid-cols-1 gap-6 md:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='flex flex-col items-center gap-4 rounded-2xl border bg-card p-6'>
              <Skeleton className='size-12' shape='circle' />
              <Skeleton className='h-6 w-3/4' shape='text' />
              <Skeleton className='h-4 w-full' shape='text' />
              <Skeleton className='h-4 w-5/6' shape='text' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
