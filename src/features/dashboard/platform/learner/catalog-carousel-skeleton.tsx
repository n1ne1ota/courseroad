import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { cn } from '@/lib/utils/cn';

import {
  CATALOG_PREVIEW_COUNT,
  courseGridClass,
  glassCardClass
} from '@/features/dashboard/shared/ui/dashboard-surfaces';

/** Skeleton for `CatalogCarousel`: section header, then the same number of course cards. */
export function CatalogCarouselSkeleton(): JSX.Element {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-8 w-48' shape='text' />
          <Skeleton className='h-4 w-72 max-w-full' shape='text' />
        </div>
        <Skeleton className='h-5 w-16' shape='text' />
      </div>

      <div className={courseGridClass}>
        {Array.from({ length: CATALOG_PREVIEW_COUNT }, (_, i) => (
          <div key={i} className={cn(glassCardClass, 'h-full bg-background/30')}>
            <Skeleton className='aspect-video w-full rounded-none' />
            <div className='flex flex-1 flex-col p-5'>
              <Skeleton className='h-3 w-32' shape='text' />
              <Skeleton className='mt-2 h-5 w-3/4' shape='text' />
              <div className='mt-2 flex flex-col gap-1.5'>
                <Skeleton className='h-3 w-full' shape='text' />
                <Skeleton className='h-3 w-4/5' shape='text' />
              </div>
              <div className='flex-1 py-4' />
              <div className='mt-auto flex items-center justify-between border-t border-border/40 pt-4'>
                <Skeleton className='h-4 w-24' shape='text' />
                <Skeleton className='size-8' shape='circle' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
