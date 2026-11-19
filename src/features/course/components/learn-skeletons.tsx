import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { ChevronLeft } from 'lucide-react';

/** Skeleton for a lesson: video player, title and module line with action buttons, then the reading material. */
export function LessonPageSkeleton(): JSX.Element {
  return (
    <div className='mx-auto w-full max-w-5xl' aria-hidden='true'>
      <Skeleton className='mb-8 aspect-video w-full rounded-2xl' />

      <div className='mb-10 flex flex-col items-start justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end'>
        <div className='flex flex-col gap-3'>
          <Skeleton className='h-9 w-80 max-w-full md:h-10' shape='text' />
          <Skeleton className='h-5 w-64 max-w-full' shape='text' />
        </div>
        <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center'>
          <Skeleton className='h-10 w-full sm:w-44' />
          <Skeleton className='h-10 w-full sm:w-36' />
        </div>
      </div>

      <div className='flex flex-col gap-3'>
        <Skeleton className='h-4 w-full' shape='text' />
        <Skeleton className='h-4 w-full' shape='text' />
        <Skeleton className='h-4 w-5/6' shape='text' />
        <Skeleton className='h-4 w-2/3' shape='text' />
      </div>
    </div>
  );
}

/**
 * Skeleton for the full-screen learn layout: course outline sidebar and the lesson area.
 * Used as the fallback while the layout loads the course, so it carries its own lesson placeholder.
 */
export function LearnShellSkeleton(): JSX.Element {
  return (
    <div className='flex h-dvh w-full overflow-hidden bg-background'>
      <aside className='flex w-80 shrink-0 flex-col border-r border-border bg-muted/20 max-lg:hidden'>
        <div className='flex flex-col gap-4 border-b border-border p-4'>
          <span className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground'>
            <ChevronLeft className='size-4' />
            Back to Dashboard
          </span>
          <Skeleton className='h-6 w-3/4' shape='text' />
        </div>

        <div className='flex-1 overflow-hidden p-4'>
          <div className='space-y-6'>
            {Array.from({ length: 3 }, (_, moduleIndex) => (
              <div key={moduleIndex} className='space-y-2'>
                <Skeleton className='h-4 w-48' shape='text' />
                <div className='flex flex-col gap-1'>
                  {Array.from({ length: 3 }, (_, lessonIndex) => (
                    <div key={lessonIndex} className='flex items-start gap-3 p-2.5'>
                      <Skeleton className='mt-0.5 size-4 shrink-0' shape='circle' />
                      <Skeleton className='h-4 w-40' shape='text' />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className='relative flex flex-1 flex-col overflow-hidden px-4 py-6 sm:px-8'>
        <div className='mb-6 flex items-center justify-between lg:hidden'>
          <Skeleton className='size-9' />
          <Skeleton className='h-5 w-40' shape='text' />
        </div>
        <LessonPageSkeleton />
      </main>
    </div>
  );
}
