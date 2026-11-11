'use client';

import { Card, Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for OTP page
 */
export function OtpSkeleton() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <Card className='flex w-full max-w-sm flex-col gap-4 p-8'>
        <Skeleton className='h-7 w-32 rounded-lg' />
        <Skeleton className='h-4 w-64 rounded-md' />
        <div className='flex justify-center py-2'>
          <div className='flex gap-2'>
            <Skeleton className='size-10 rounded-xl' />
            <Skeleton className='size-10 rounded-xl' />
            <Skeleton className='size-10 rounded-xl' />
            <Skeleton className='size-10 rounded-xl' />
            <Skeleton className='size-10 rounded-xl' />
            <Skeleton className='size-10 rounded-xl' />
          </div>
        </div>
        <Skeleton className='rounded-medium h-10 w-full' />
        <Skeleton className='mx-auto h-4 w-44 rounded-md' />
      </Card>
    </div>
  );
}
