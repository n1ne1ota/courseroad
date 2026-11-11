import { Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for About page
 */
export function AboutSkeleton() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-16 space-y-4 text-center'>
          <Skeleton className='mx-auto h-6 w-32 rounded-lg' />
          <Skeleton className='mx-auto h-10 w-56 rounded-lg' />
          <Skeleton className='mx-auto h-5 w-full max-w-2xl rounded-lg' />
        </div>
        <div className='space-y-8'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className='space-y-4'>
              <Skeleton className='h-7 w-48 rounded-lg' />
              <Skeleton className='h-4 w-full rounded-lg' />
              <Skeleton className='h-4 w-full rounded-lg' />
              <Skeleton className='h-4 w-3/4 rounded-lg' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
