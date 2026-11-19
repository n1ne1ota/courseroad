import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import {
  chartPanelClass,
  metricCardClass,
  SALES_CHART_BAR_COUNT
} from '@/features/dashboard/shared/ui/dashboard-surfaces';

/** Skeleton for `InstructorMetrics`: three metric cards, then the sales bar chart panel. */
export function InstructorMetricsSkeleton(): JSX.Element {
  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-1 gap-6 @2xl/main:grid-cols-2 @4xl/main:grid-cols-3'>
        {[0, 1, 2].map(i => (
          <div key={i} className={metricCardClass}>
            <div className='flex items-center justify-between gap-4'>
              <div className='space-y-2'>
                <Skeleton className='h-5 w-28' shape='text' />
                <Skeleton className='h-8 w-32' shape='text' />
                <Skeleton className='h-4 w-36' shape='text' />
              </div>
              <Skeleton className='size-14 shrink-0 rounded-2xl' />
            </div>
          </div>
        ))}
      </div>

      <div className={chartPanelClass}>
        <div className='border-default-200/50 mb-6 flex items-center justify-between gap-4 border-b pb-5'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-56' shape='text' />
            <Skeleton className='h-5 w-64' shape='text' />
          </div>
        </div>
        <div className='relative flex h-64 w-full items-end justify-between gap-2 px-2 pt-4'>
          {Array.from({ length: SALES_CHART_BAR_COUNT }, (_, i) => (
            <div key={i} className='flex flex-1 flex-col items-center gap-2'>
              <Skeleton
                className='w-full rounded-t-xl'
                style={{ height: `${20 + (i % 5) * 15}%`, minHeight: '16px' }}
              />
              <Skeleton className='h-4 w-8' shape='text' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
