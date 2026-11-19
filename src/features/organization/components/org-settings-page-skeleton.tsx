import type { JSX } from 'react';

import { Separator, Skeleton } from '@courseroad/kurume-ui';

/** Skeleton for `OrgSettingsPage`: tab bar, separator, then the General form (heading, three fields, save). */
export function OrgSettingsPageSkeleton(): JSX.Element {
  return (
    <div className='space-y-6'>
      <div className='flex gap-2'>
        {[20, 24, 20].map((width, i) => (
          <Skeleton key={i} className='h-9 rounded-lg' style={{ width: `${width * 4}px` }} />
        ))}
      </div>

      <Separator role='presentation' />

      <div className='space-y-6'>
        <div className='space-y-1'>
          <Skeleton className='h-6 w-24' shape='text' />
          <Skeleton className='h-4 w-72 max-w-full' shape='text' />
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' shape='text' />
            <Skeleton className='h-9 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' shape='text' />
            <Skeleton className='h-9 w-full' />
            <Skeleton className='h-3 w-64 max-w-full' shape='text' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' shape='text' />
            <div className='flex items-center gap-4'>
              <Skeleton className='size-14 shrink-0 rounded-xl' />
              <Skeleton className='h-9 flex-1' />
            </div>
          </div>
        </div>

        <div className='flex justify-end'>
          <Skeleton className='h-9 w-28' />
        </div>
      </div>
    </div>
  );
}
