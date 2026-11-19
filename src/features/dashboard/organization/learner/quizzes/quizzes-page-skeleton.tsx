import type { JSX } from 'react';

import { Card, CardContent, CardFooter, CardHeader, Skeleton } from '@courseroad/kurume-ui';

import { cn } from '@/lib/utils/cn';

import { listCardGridClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';

/** Skeleton for `LearnerQuizzesView`: quiz cards with title, description, meta row, and the action button. */
export function LearnerQuizzesViewSkeleton({ count = 3 }: { count?: number }): JSX.Element {
  return (
    <div className={cn('mt-6', listCardGridClass)}>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className='flex flex-col overflow-hidden'>
          <CardHeader>
            <Skeleton className='h-5 w-3/4' shape='text' />
            <div className='mt-2 flex flex-col gap-1.5'>
              <Skeleton className='h-4 w-full' shape='text' />
              <Skeleton className='h-4 w-2/3' shape='text' />
            </div>
          </CardHeader>
          <CardContent className='flex flex-1 flex-col gap-3'>
            <div className='flex flex-wrap gap-3'>
              <Skeleton className='h-4 w-24' shape='text' />
              <Skeleton className='h-4 w-16' shape='text' />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className='h-9 w-full' />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
