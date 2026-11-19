'use client';

import { Card, Skeleton } from '@courseroad/iota-ui';

import { HomeButton } from './home-button';

/**
 * Skeleton for the provider view that sign-in and sign-up open on: the real Home button, a heading,
 * "Continue with Email", the OR divider, three provider buttons, and the account-switch line.
 * The email form only appears after a click, so it isn't part of the loading state.
 */
export function AuthProviderViewSkeleton() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='w-full max-w-sm'>
        <HomeButton />
        <Card className='flex w-full flex-col gap-4 p-8'>
          <Skeleton className='mx-auto mb-4 h-8 w-32' shape='text' />

          <div className='flex flex-col gap-4'>
            <Skeleton className='h-10 w-full' />

            <div className='flex items-center gap-4'>
              <Skeleton className='h-px flex-1' />
              <Skeleton className='h-3 w-5' shape='text' />
              <Skeleton className='h-px flex-1' />
            </div>

            <div className='flex flex-col gap-2'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>

            <Skeleton className='mx-auto mt-3 h-4 w-52' shape='text' />
          </div>
        </Card>
      </div>
    </div>
  );
}
