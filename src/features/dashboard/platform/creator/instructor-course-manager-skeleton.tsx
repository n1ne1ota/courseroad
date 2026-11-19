import type { JSX } from 'react';

import { Card, CardContent, CardFooter, CardMedia, Skeleton } from '@courseroad/kurume-ui';

import { workspaceGridClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';

/** Matches the cover, metadata and actions in the authored course cards. */
export function InstructorCourseManagerSkeleton({ count = 3 }: { count?: number }): JSX.Element {
  return (
    <div className={workspaceGridClass} aria-hidden='true'>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className='min-w-0' size='sm'>
          <CardMedia>
            <Skeleton className='size-full rounded-none' />
          </CardMedia>
          <CardContent className='flex flex-1 flex-col gap-stack'>
            <div className='flex items-center justify-between gap-2'>
              <Skeleton className='h-5 w-16 rounded-full' />
              <Skeleton className='h-3 w-16' shape='text' />
            </div>
            <Skeleton className='h-5 w-5/6' shape='text' />
            <Skeleton className='h-5 w-24 rounded-full' />
          </CardContent>
          <CardFooter>
            <div className='flex flex-col gap-1'>
              <Skeleton className='h-5 w-14' shape='text' />
              <Skeleton className='h-4 w-24' shape='text' />
            </div>
            <Skeleton className='h-8 w-28 rounded-md' />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
