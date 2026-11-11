'use client';

import { Card, Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for Account/Student Dashboard
 */
export function AccountSkeleton() {
  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8 space-y-2'>
        <Skeleton className='h-8 w-48 rounded-lg' />
        <Skeleton className='h-5 w-64 rounded-lg' />
      </div>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className='p-6'>
            <Skeleton className='mb-4 h-10 w-10 rounded-lg' />
            <Skeleton className='mb-2 h-5 w-32 rounded-lg' />
            <Skeleton className='h-4 w-24 rounded-lg' />
          </Card>
        ))}
      </div>
    </div>
  );
}
