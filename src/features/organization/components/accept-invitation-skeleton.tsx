import type { JSX } from 'react';

import { Card, Skeleton } from '@courseroad/iota-ui';

/** Skeleton for `AcceptInvitation`: centered narrow card with a heading, organization details, and actions. */
export function AcceptInvitationSkeleton(): JSX.Element {
  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <Card className='w-full max-w-md space-y-5 p-8'>
        <Skeleton className='h-8 w-64 max-w-full' shape='text' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' shape='text' />
          <Skeleton className='h-4 w-4/5' shape='text' />
        </div>
        <div className='flex gap-4'>
          <Skeleton className='h-10 w-28' />
          <Skeleton className='h-10 w-28' />
        </div>
      </Card>
    </div>
  );
}
