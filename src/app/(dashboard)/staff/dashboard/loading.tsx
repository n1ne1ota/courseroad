import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

export default function StaffDashboardLoading(): JSX.Element {
  return (
    <div className='relative flex animate-pulse flex-col gap-8 px-4 pt-6 pb-12 lg:px-6'>
      {/* Welcome/Header Skeleton */}
      <div className='w-full max-w-lg space-y-3'>
        <Skeleton className='h-8 w-48' shape='text' />
        <Skeleton className='h-5 w-80' shape='text' />
      </div>

      {/* 4 DashboardCards Skeleton */}
      <div className='grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className='border-default-200/50 flex flex-col justify-between rounded-2xl border bg-background/20 p-6'
          >
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-20' shape='text' />
                <Skeleton className='h-8 w-28' shape='text' />
                <Skeleton className='h-3 w-32' shape='text' />
              </div>
              <Skeleton className='size-12 rounded-xl' />
            </div>
            <div className='border-default-100 mt-6 border-t pt-4'>
              <Skeleton className='h-4 w-3/4' shape='text' />
            </div>
          </div>
        ))}
      </div>

      {/* Moderation Activity Chart Skeleton */}
      <div className='border-default-200/50 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
        <div className='border-default-200/50 mb-6 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-56' shape='text' />
            <Skeleton className='h-4 w-72' shape='text' />
          </div>
          {/* Toggle buttons skeleton */}
          <div className='flex gap-2'>
            <Skeleton className='h-9 w-28 rounded-lg' />
            <Skeleton className='h-9 w-28 rounded-lg' />
            <Skeleton className='h-9 w-28 rounded-lg' />
          </div>
        </div>
        {/* SVG Bar Chart Skeleton */}
        <div className='w-full overflow-hidden'>
          <div className='relative flex h-64 w-full items-end justify-between gap-4 px-2 pt-4'>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className='flex flex-1 flex-col items-center gap-2'>
                <Skeleton
                  className='w-full rounded-t-lg bg-primary/20'
                  style={{ height: `${30 + (i % 4) * 20}%`, minHeight: '24px' }}
                />
                <Skeleton className='h-3 w-10' shape='text' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
