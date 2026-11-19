import type { JSX } from 'react';

import { Card, Skeleton } from '@courseroad/iota-ui';

import { courseCardClass, courseCatalogGridClass } from '../lib/course-card-surfaces';

/** Skeleton for `CourseCard`: thumbnail, title, two description lines, and the "by creator" footer. */
export function CourseCardSkeleton(): JSX.Element {
  return (
    <Card className={courseCardClass} shadow='md' variant='frosted-glass'>
      <Skeleton className='aspect-video w-full rounded-none' />
      <div className='flex flex-1 flex-col p-5'>
        <Skeleton className='h-6 w-4/5' shape='text' />
        <div className='mt-2 flex flex-col gap-1.5'>
          <Skeleton className='h-4 w-full' shape='text' />
          <Skeleton className='h-4 w-2/3' shape='text' />
        </div>
        <div className='flex-1' />
        <div className='mt-5 flex items-center justify-between'>
          <Skeleton className='h-4 w-28' shape='text' />
        </div>
      </div>
    </Card>
  );
}

/** Skeleton for the public catalog grid; renders the same grid classes as the loaded catalog. */
export function CourseCatalogSkeleton({ count = 6 }: { count?: number }): JSX.Element {
  return (
    <div className={courseCatalogGridClass}>
      {Array.from({ length: count }, (_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
