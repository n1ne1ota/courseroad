import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import {
  historyPanelClass,
  historyPanelHeaderClass,
  metricCardClass
} from '@/features/dashboard/shared/ui/dashboard-surfaces';

/** Skeleton for `BillingSection`: the overview card, then the history panel with a header row and invoice rows. */
export function BillingSectionSkeleton({ rows = 4 }: { rows?: number }): JSX.Element {
  return (
    <div className='flex flex-col gap-6'>
      <div className={metricCardClass}>
        <div className='flex items-center gap-4'>
          <Skeleton className='size-12 shrink-0 rounded-2xl' />
          <div className='space-y-2'>
            <Skeleton className='h-6 w-40' shape='text' />
            <Skeleton className='h-4 w-72 max-w-full' shape='text' />
          </div>
        </div>
      </div>

      <div className={historyPanelClass}>
        <div className={historyPanelHeaderClass}>
          <Skeleton className='h-5 w-32' shape='text' />
        </div>
        <div className='divide-default-200/50 divide-y'>
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className='flex items-center gap-6 px-6 py-4'>
              <Skeleton className='h-4 w-24 shrink-0' shape='text' />
              <Skeleton className='h-4 flex-1' shape='text' />
              <Skeleton className='hidden h-4 w-20 sm:block' shape='text' />
              <Skeleton className='hidden h-6 w-16 rounded-full sm:block' />
              <Skeleton className='h-8 w-24 rounded-xl' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
