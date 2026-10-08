'use client';

import { Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for Staff Dashboard
 */
export function StaffDashboardSkeleton() {
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
        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <Skeleton className='mb-6 h-6 w-40 rounded-md' />
          <div className='flex flex-col gap-6'>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className='flex items-center justify-between border-b pb-4 last:border-0'>
                <div className='flex items-center gap-4'>
                  <Skeleton className='size-12 rounded-lg' />
                  <div className='flex flex-col gap-2'>
                    <Skeleton className='h-5 w-48 rounded-md' />
                    <Skeleton className='h-4 w-32 rounded-md' />
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Skeleton className='h-10 w-24 rounded-md' />
                  <Skeleton className='h-10 w-24 rounded-md' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
