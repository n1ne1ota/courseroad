import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

/** Skeleton for `MembersPage`: invite form block, members heading, and the member table. */
export function MembersPageSkeleton({ rows = 5 }: { rows?: number }): JSX.Element {
  return (
    <div className='space-y-8'>
      <Skeleton className='h-24 w-full rounded-xl' />

      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Skeleton className='size-5' />
          <Skeleton className='h-6 w-24' shape='text' />
          <Skeleton className='h-5 w-8 rounded-full' />
        </div>

        <div className='rounded-xl border'>
          <div className='flex items-center gap-6 border-b px-4 py-3'>
            <Skeleton className='h-4 w-20' shape='text' />
            <Skeleton className='ml-auto h-4 w-12 sm:ml-[30%]' shape='text' />
            <Skeleton className='hidden h-4 w-16 sm:block' shape='text' />
          </div>
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className='flex items-center gap-6 border-b px-4 py-3 last:border-0'>
              <div className='flex items-center gap-3'>
                <Skeleton className='size-8 shrink-0' shape='circle' />
                <div className='space-y-1.5'>
                  <Skeleton className='h-4 w-28' shape='text' />
                  <Skeleton className='h-3 w-40' shape='text' />
                </div>
              </div>
              <Skeleton className='ml-auto h-8 w-28 sm:ml-[10%]' />
              <Skeleton className='hidden h-4 w-24 sm:block' shape='text' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
