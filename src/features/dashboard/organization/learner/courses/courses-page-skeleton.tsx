import type { JSX } from 'react';

import { Card, CardContent, CardHeader, Skeleton } from '@courseroad/kurume-ui';

/** Skeleton for `LearnerCoursesView`: the dashed enrolled-courses card with a title, description, and body line. */
export function LearnerCoursesViewSkeleton(): JSX.Element {
  return (
    <Card className='border-dashed'>
      <CardHeader>
        <Skeleton className='h-6 w-48' shape='text' />
        <Skeleton className='mt-2 h-4 w-96 max-w-full' shape='text' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-5 w-72 max-w-full' shape='text' />
      </CardContent>
    </Card>
  );
}
