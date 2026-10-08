import { Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for Pricing page
 */
export function PricingSkeleton() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-12 space-y-4 text-center'>
          <Skeleton className='mx-auto h-6 w-32 rounded-lg' />
          <Skeleton className='mx-auto h-10 w-64 rounded-lg' />
          <Skeleton className='mx-auto h-5 w-96 rounded-lg' />
        </div>
        <div className='grid gap-8 md:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='rounded-xl border bg-card p-6 text-card-foreground'>
              <Skeleton className='mb-2 h-6 w-24 rounded-lg' />
              <Skeleton className='mb-4 h-4 w-32 rounded-lg' />
              <Skeleton className='mb-6 h-10 w-20 rounded-lg' />
              <Skeleton className='mb-6 h-10 w-full rounded-lg' />
              <div className='space-y-3'>
                {[1, 2, 3, 4, 5].map(j => (
                  <Skeleton key={j} className='h-4 w-full rounded-lg' />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
