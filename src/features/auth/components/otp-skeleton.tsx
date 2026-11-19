'use client';

import { Card, Skeleton } from '@courseroad/iota-ui';

/** Skeleton for the OTP and two-factor pages: heading, description, six code slots, two buttons, and a link. */
export function OtpSkeleton() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='w-full max-w-sm'>
        <Card className='flex w-full flex-col gap-4 p-8'>
          <Skeleton className='mx-auto mb-4 h-8 w-40' shape='text' />
          <div className='flex flex-col items-center gap-2'>
            <Skeleton className='h-4 w-64 max-w-full' shape='text' />
            <Skeleton className='h-4 w-48' shape='text' />
          </div>
          <div className='flex justify-center py-2'>
            <div className='flex gap-2'>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className='size-10 rounded-xl' />
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='mx-auto mt-3 h-4 w-44' shape='text' />
        </Card>
      </div>
    </div>
  );
}
