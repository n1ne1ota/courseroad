import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

export default function TeacherDashboardLoading(): JSX.Element {
  return (
    <div className='relative flex animate-pulse flex-col gap-8 px-4 pt-6 pb-12 lg:px-6'>
      {/* Welcome Message Skeleton */}
      <div className='w-full max-w-lg space-y-3'>
        <Skeleton className='h-8 w-64' shape='text' />
        <Skeleton className='h-5 w-96' shape='text' />
      </div>

      {/* Metric Cards Skeleton */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className='border-default-200/50 relative overflow-hidden rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'
          >
            <div className='flex items-center justify-between gap-4'>
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-24' shape='text' />
                <Skeleton className='h-8 w-32' shape='text' />
                <Skeleton className='h-3 w-36' shape='text' />
              </div>
              <Skeleton className='size-14 rounded-2xl' />
            </div>
          </div>
        ))}
      </div>

      {/* Sales Trends Chart Skeleton */}
      <div className='border-default-200/50 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
        <div className='border-default-200/50 mb-6 flex items-center justify-between gap-4 border-b pb-5'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-48' shape='text' />
            <Skeleton className='h-4 w-64' shape='text' />
          </div>
        </div>
        {/* SVG Area Chart Skeleton */}
        <div className='w-full overflow-hidden'>
          <div className='relative flex h-64 w-full items-end justify-between gap-2 px-2 pt-4'>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
              <div key={i} className='flex flex-1 flex-col items-center gap-2'>
                <Skeleton
                  className='w-full rounded-t-xl bg-primary/20'
                  style={{ height: `${20 + (i % 5) * 15}%`, minHeight: '16px' }}
                />
                <Skeleton className='h-3 w-8' shape='text' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
