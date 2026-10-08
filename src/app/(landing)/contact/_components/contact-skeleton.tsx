import { Skeleton } from '@courseroad/iota-ui';

/**
 * Skeleton for Contact page
 */
export function ContactSkeleton() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-12 space-y-4 text-center'>
          <Skeleton className='mx-auto h-6 w-32 rounded-lg' />
          <Skeleton className='mx-auto h-10 w-48 rounded-lg' />
          <Skeleton className='mx-auto h-5 w-full max-w-2xl rounded-lg' />
        </div>
        <div className='mb-16 grid gap-6 md:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='rounded-xl border bg-card p-6 text-card-foreground'>
              <Skeleton className='mb-3 h-8 w-8 rounded-lg' />
              <Skeleton className='mb-2 h-5 w-32 rounded-lg' />
              <Skeleton className='mb-4 h-4 w-full rounded-lg' />
              <Skeleton className='h-8 w-full rounded-lg' />
            </div>
          ))}
        </div>
        <div className='space-y-4 rounded-xl border bg-card p-8 text-card-foreground'>
          <Skeleton className='h-6 w-48 rounded-lg' />
          <Skeleton className='h-4 w-full rounded-lg' />
          <Skeleton className='h-4 w-full rounded-lg' />
          <Skeleton className='h-4 w-3/4 rounded-lg' />
        </div>
      </div>
    </div>
  );
}
