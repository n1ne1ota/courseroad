'use client';

import { Card, Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for Sign Up page
 */
export function SignUpSkeleton() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <Card className='flex w-full max-w-sm flex-col gap-4 p-8'>
        <Skeleton className='h-7 w-24 rounded-lg' />
        <div className='flex flex-col gap-y-3'>
          <Skeleton className='rounded-medium h-14 w-full' />
          <Skeleton className='rounded-medium h-14 w-full' />
          <Skeleton className='rounded-medium h-14 w-full' />
          <Skeleton className='rounded-medium h-14 w-full' />
          <div className='flex py-2'>
            <Skeleton className='h-5 w-48 rounded-md' />
          </div>
          <Skeleton className='rounded-medium h-10 w-full' />

          <div className='flex items-center gap-4 py-2'>
            <Skeleton className='h-px flex-1' />
            <Skeleton className='h-4 w-6' />
            <Skeleton className='h-px flex-1' />
          </div>

          <div className='flex flex-col gap-2'>
            <Skeleton className='rounded-medium h-10 w-full' />
            <Skeleton className='rounded-medium h-10 w-full' />
          </div>

          <Skeleton className='mx-auto mt-3 h-4 w-48 rounded-md' />
        </div>
      </Card>
    </div>
  );
}
