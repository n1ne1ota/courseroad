import { Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for Blog page
 */
export function BlogSkeleton() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='mb-8 space-y-4 text-center'>
        <Skeleton className='mx-auto h-10 w-32 rounded-lg' />
        <Skeleton className='mx-auto h-5 w-48 rounded-lg' />
      </div>
      <div className='space-y-8'>
        {[1, 2, 3].map(i => (
          <div key={i} className='flex gap-6 rounded-xl border bg-card p-6 text-card-foreground'>
            <Skeleton className='h-32 w-48 flex-shrink-0 rounded-lg' />
            <div className='space-y-2'>
              <Skeleton className='h-6 w-3/4 rounded-lg' />
              <Skeleton className='h-4 w-full rounded-lg' />
              <Skeleton className='h-4 w-2/3 rounded-lg' />
              <Skeleton className='h-4 w-24 rounded-lg' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
