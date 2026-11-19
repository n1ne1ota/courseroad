import type { JSX } from 'react';

import { Card, CardContent, CardHeader, Skeleton } from '@courseroad/kurume-ui';

/**
 * Skeleton for `QuizPlayer`: title and attempts header, segmented progress with counts,
 * then the question navigator (wide screens only) beside the question card.
 */
export function QuizPlayerSkeleton({ navigatorCount = 8 }: { navigatorCount?: number }): JSX.Element {
  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0 flex-1 space-y-2'>
          <Skeleton className='h-6 w-64 max-w-full' shape='text' />
          <Skeleton className='h-4 w-96 max-w-full' shape='text' />
        </div>
        <Skeleton className='h-8 w-24 shrink-0 rounded-lg' />
      </div>

      <div className='space-y-1.5'>
        <Skeleton className='h-2 w-full rounded-full' />
        <div className='flex items-center justify-between'>
          <Skeleton className='h-3 w-24' shape='text' />
          <Skeleton className='h-3 w-12' shape='text' />
        </div>
      </div>

      <div className='grid gap-4 2xl-screen:grid-cols-[240px_1fr]'>
        <div className='hidden 2xl-screen:block'>
          <Card>
            <CardHeader>
              <Skeleton className='h-3 w-20' shape='text' />
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='grid grid-cols-4 gap-1.5'>
                {Array.from({ length: navigatorCount }, (_, i) => (
                  <Skeleton key={i} className='h-8 w-full rounded-lg' />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-3/4' shape='text' />
          </CardHeader>
          <CardContent className='space-y-3'>
            {[0, 1, 2, 3].map(i => (
              <Skeleton key={i} className='h-12 w-full rounded-lg' />
            ))}
            <div className='flex justify-between pt-2'>
              <Skeleton className='h-9 w-24' />
              <Skeleton className='h-9 w-24' />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
