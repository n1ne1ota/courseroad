'use client';

import { Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for Navigation/Header
 */
export function NavigationSkeleton() {
  return (
    <nav className='flex h-16 items-center justify-between border-b bg-background px-4'>
      <Skeleton className='h-8 w-28 rounded-lg' />
      <div className='hidden items-center gap-6 md:flex'>
        <Skeleton className='h-4 w-16 rounded-lg' />
        <Skeleton className='h-4 w-16 rounded-lg' />
        <Skeleton className='h-4 w-16 rounded-lg' />
        <Skeleton className='h-4 w-16 rounded-lg' />
      </div>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-8 w-20 rounded-full' />
        <Skeleton className='h-8 w-8 rounded-full' />
      </div>
    </nav>
  );
}
