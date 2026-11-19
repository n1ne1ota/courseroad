import { Card, Skeleton } from '@courseroad/iota-ui';

/** The feed's loading state: a heading row and three cards the size of real ones. */
export function AnnouncementFeedSkeleton() {
  return (
    <div className='flex flex-col gap-6' aria-hidden>
      <Skeleton className='h-9 w-56' />
      <ul className='flex flex-col gap-4'>
        {[0, 1, 2].map(index => (
          <li key={index}>
            <Card className='flex flex-col gap-3 p-5'>
              <Skeleton className='h-5 w-40' />
              <Skeleton className='h-6 w-3/4' />
              <Skeleton className='h-4 w-full' />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnnouncementDetailSkeleton() {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6' aria-hidden>
      <Skeleton className='h-4 w-32' />
      <Skeleton className='h-9 w-3/4' />
      <Skeleton className='h-4 w-48' />
      <Skeleton className='h-40 w-full' />
    </div>
  );
}
