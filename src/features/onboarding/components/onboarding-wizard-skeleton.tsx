import type { JSX } from 'react';

import { Card, Skeleton } from '@courseroad/iota-ui';

/** Skeleton for `OnboardingWizard`: centered wide card with a greeting and three path tiles. */
export function OnboardingWizardSkeleton(): JSX.Element {
  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <div className='w-full max-w-3xl'>
        <Card className='flex w-full flex-col gap-6 overflow-hidden p-8'>
          <div className='flex flex-col items-center gap-2 text-center'>
            <Skeleton className='h-8 w-64 max-w-full' shape='text' />
            <Skeleton className='h-4 w-80 max-w-full' shape='text' />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className='flex flex-col items-center gap-3 rounded-2xl border border-border p-6 text-center'
              >
                <Skeleton className='size-10 rounded-xl' />
                <Skeleton className='h-6 w-24' shape='text' />
                <div className='flex w-full flex-col items-center gap-1.5'>
                  <Skeleton className='h-4 w-full' shape='text' />
                  <Skeleton className='h-4 w-4/5' shape='text' />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
