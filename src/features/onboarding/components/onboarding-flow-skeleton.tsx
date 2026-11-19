import type { JSX } from 'react';

import { Card, Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for the single-card onboarding flows (learner, creator, organization):
 * a step indicator, form fields, and the continue button inside a centered narrow card.
 */
export function OnboardingFlowSkeleton(): JSX.Element {
  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Card className='flex w-full flex-col gap-4 overflow-hidden p-8'>
          <div className='flex items-center justify-between gap-2'>
            {[0, 1, 2].map(i => (
              <Skeleton key={i} className='h-2 flex-1 rounded-full' />
            ))}
          </div>

          <div className='mt-6 flex flex-col gap-2'>
            <Skeleton className='h-7 w-56 max-w-full' shape='text' />
            <Skeleton className='h-4 w-72 max-w-full' shape='text' />
          </div>

          <div className='mt-4 flex flex-col gap-4'>
            {[0, 1, 2].map(i => (
              <div key={i} className='flex flex-col gap-2'>
                <Skeleton className='h-4 w-24' shape='text' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}
          </div>

          <Skeleton className='mt-6 h-10 w-full' />
        </Card>
      </div>
    </div>
  );
}
