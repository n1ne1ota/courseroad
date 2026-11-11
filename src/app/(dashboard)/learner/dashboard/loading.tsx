import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

export default function StudentDashboardLoading(): JSX.Element {
  return (
    <div className='relative flex animate-pulse flex-col gap-8 px-4 pt-6 pb-12 lg:px-6'>
      {/* Hero Header Skeleton */}
      <div className='border-default-200/50 flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border bg-background/20 p-8 shadow-sm backdrop-blur-sm md:flex-row md:items-center'>
        <div className='w-full max-w-lg space-y-3'>
          <Skeleton className='h-6 w-24 rounded-full' />
          <Skeleton className='h-9 w-64' shape='text' />
          <Skeleton className='h-5 w-full max-w-sm' shape='text' />
        </div>
      </div>

      {/* Switcher Switch Cards Skeleton */}
      <div className='flex flex-col gap-4'>
        <div className='space-y-2'>
          <Skeleton className='h-7 w-36' shape='text' />
          <Skeleton className='h-4 w-64' shape='text' />
        </div>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='border-default-200/50 flex flex-col justify-between rounded-2xl border bg-background/20 p-6'
            >
              <div className='flex items-start gap-4'>
                <Skeleton className='size-12 rounded-xl' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-5 w-3/4' shape='text' />
                  <Skeleton className='h-4 w-1/2' shape='text' />
                </div>
              </div>
              <div className='mt-8 flex justify-end'>
                <Skeleton className='h-5 w-24' shape='text' />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course List Skeleton */}
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-7 w-32' shape='text' />
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className='border-default-200/50 overflow-hidden rounded-2xl border bg-background/20'>
              <Skeleton className='aspect-video w-full' />
              <div className='space-y-4 p-5'>
                <Skeleton className='h-5 w-5/6' shape='text' />
                <div className='space-y-2 pt-2'>
                  <Skeleton className='h-4 w-1/4' shape='text' />
                  <Skeleton className='h-2 w-full rounded-full' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
