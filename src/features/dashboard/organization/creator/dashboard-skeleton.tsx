'use client';

import { Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for Creator Dashboard
 */
export function CreatorDashboardSkeleton() {
  return (
    <div className='flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className='flex flex-col rounded-xl border bg-card p-6 shadow-sm'>
            <Skeleton className='mb-2 h-4 w-24 rounded-md' />
            <Skeleton className='mb-4 h-8 w-20 rounded-md' />
            <Skeleton className='h-4 w-32 rounded-md' />
          </div>
        ))}
      </div>

      <div className='px-4 lg:px-6'>
        <div className='flex flex-col rounded-xl border bg-card shadow-sm'>
          <div className='p-6 pb-2'>
            <Skeleton className='mb-2 h-6 w-32 rounded-md' />
            <Skeleton className='h-4 w-48 rounded-md' />
          </div>
          <div className='p-6 pt-4'>
            <Skeleton className='h-[250px] w-full rounded-md' />
          </div>
        </div>
      </div>

      <div className='px-4 lg:px-6'>
        <Skeleton className='mb-4 h-10 w-[300px] rounded-md' />
        <div className='rounded-xl border bg-card shadow-sm'>
          <div className='border-b p-4'>
            <Skeleton className='h-10 w-full rounded-md' />
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className='border-b p-4 last:border-0'>
              <Skeleton className='h-6 w-full rounded-md' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
