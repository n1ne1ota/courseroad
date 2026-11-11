'use client';

import { Card, Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for Forgot Password page
 */
export function ForgotPasswordSkeleton() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <Card className='flex w-full max-w-sm flex-col gap-4 p-8'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-7 w-40 rounded-lg' />
          <Skeleton className='h-4 w-full max-w-[280px] rounded-lg' />
          <Skeleton className='h-4 w-4/5 rounded-lg' />
        </div>

        <div className='mt-2 flex flex-col gap-4'>
          <Skeleton className='rounded-medium h-14 w-full' />
          <Skeleton className='rounded-medium h-10 w-full' />
        </div>

        <Skeleton className='mx-auto mt-2 h-4 w-24 rounded-md' />
      </Card>
    </div>
  );
}
