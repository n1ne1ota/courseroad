import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { cn } from '@/lib/utils/cn';

import { glassCardClass, workspaceGridClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';

/** Skeleton for `B2COrgList`: workspace cards plus the dashed join/create card. */
export function B2COrgListSkeleton(): JSX.Element {
  return (
    <div className={workspaceGridClass}>
      {[0, 1].map(i => (
        <div key={i} className={cn(glassCardClass, 'justify-between p-6')}>
          <div className='flex items-start gap-4'>
            <Skeleton className='size-12 shrink-0 rounded-xl' />
            <div className='flex flex-col gap-2'>
              <Skeleton className='h-5 w-32' shape='text' />
              <Skeleton className='h-3 w-40' shape='text' />
              <Skeleton className='mt-0.5 h-5 w-16 rounded-full' />
            </div>
          </div>
          <div className='mt-8 flex justify-end'>
            <Skeleton className='h-5 w-32' shape='text' />
          </div>
        </div>
      ))}

      <div className='border-default-200/50 flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6'>
        <Skeleton className='size-10' shape='circle' />
        <Skeleton className='mt-2 h-4 w-40' shape='text' />
        <Skeleton className='h-3 w-48' shape='text' />
      </div>
    </div>
  );
}
