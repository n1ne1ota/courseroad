import type { JSX } from 'react';

import { Card, Separator, Skeleton } from '@courseroad/iota-ui';

import { PublicPageShell } from '@/components/layout/public-page-shell';

/** Enrollment call-to-action in the hero card: primary button plus the two benefit lines. */
export function CourseEnrollmentSkeleton(): JSX.Element {
  return (
    <div className='flex flex-col gap-6' aria-hidden='true'>
      <Skeleton className='h-12 w-full' />
      <ul className='flex flex-col gap-3'>
        <li className='flex items-center gap-3'>
          <Skeleton className='size-4 shrink-0' shape='circle' />
          <Skeleton className='h-4 w-40' shape='text' />
        </li>
        <li className='flex items-center gap-3'>
          <Skeleton className='size-4 shrink-0' shape='circle' />
          <Skeleton className='h-4 w-48' shape='text' />
        </li>
      </ul>
    </div>
  );
}

/** Skeleton for the public course page: mirrors `CourseDetail` inside `PublicPageShell`. */
export function CourseDetailSkeleton(): JSX.Element {
  return (
    <PublicPageShell>
      <div className='flex flex-col' aria-hidden='true'>
        <Skeleton className='mb-8 h-4 w-24' shape='text' />

        <div className='grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-12'>
          <div className='flex flex-col justify-center gap-6'>
            <Skeleton className='h-5 w-48' shape='text' />
            <Skeleton className='h-12 w-full max-w-lg' shape='text' />
            <div className='flex flex-col gap-2'>
              <Skeleton className='h-5 w-full' shape='text' />
              <Skeleton className='h-5 w-4/5' shape='text' />
            </div>
            <div className='flex items-center gap-4'>
              <Skeleton className='h-5 w-36' shape='text' />
              <Skeleton className='h-5 w-24' shape='text' />
            </div>
          </div>

          <div className='flex items-center justify-center lg:justify-end'>
            <Card className='w-full max-w-md' shadow='md' variant='frosted-glass'>
              <Skeleton className='aspect-video w-full rounded-none' />
              <div className='p-6'>
                <Skeleton className='mb-6 h-9 w-24' shape='text' />
                <CourseEnrollmentSkeleton />
              </div>
            </Card>
          </div>
        </div>

        <Separator className='my-10 sm:my-12' />

        <div className='grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12'>
          <div className='space-y-10 lg:col-span-2'>
            <section>
              <h2 className='mb-6 text-2xl font-medium tracking-tight'>About This Course</h2>
              <Card className='gap-3 p-6 sm:p-8' shadow='sm' variant='frosted-glass'>
                <Skeleton className='h-4 w-full' shape='text' />
                <Skeleton className='h-4 w-full' shape='text' />
                <Skeleton className='h-4 w-3/4' shape='text' />
              </Card>
            </section>

            <section>
              <h2 className='mb-6 text-2xl font-medium tracking-tight'>Course Curriculum</h2>
              <div className='space-y-4'>
                {Array.from({ length: 3 }, (_, moduleIndex) => (
                  <Card key={moduleIndex} shadow='sm' variant='frosted-glass'>
                    <div className='flex items-center justify-between p-5'>
                      <Skeleton className='h-5 w-56' shape='text' />
                      <Skeleton className='h-4 w-16' shape='text' />
                    </div>
                    <Separator />
                    <div className='divide-y divide-border'>
                      {Array.from({ length: 3 }, (_, lessonIndex) => (
                        <div key={lessonIndex} className='flex items-center gap-4 px-5 py-4'>
                          <Skeleton className='size-5 shrink-0' shape='circle' />
                          <Skeleton className='h-4 w-2/3' shape='text' />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          <div className='space-y-8'>
            <section>
              <h2 className='mb-6 text-xl font-medium tracking-tight'>Your Instructor</h2>
              <Card className='p-6' shadow='sm' variant='frosted-glass'>
                <div className='flex items-center gap-4'>
                  <Skeleton className='size-14 shrink-0' shape='circle' />
                  <div className='flex flex-col gap-2'>
                    <Skeleton className='h-5 w-32' shape='text' />
                    <Skeleton className='h-4 w-24' shape='text' />
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
