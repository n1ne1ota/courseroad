'use client';

import type { JSX } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { BookOpen, CheckCircle2 } from 'lucide-react';

import { resolveThumbnailUrl } from '@/lib/api/cdn-url';
import { cn } from '@/lib/utils/cn';

import { courseGridClass, glassCardClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';

export interface EnrolledCourse {
  course: {
    id: string;
    title: string;
    thumbnailFileName: string | null;
    slug: string;
  };
  progressPercentage: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
}

interface PersonalCourseListProps {
  courses: EnrolledCourse[];
}

export function PersonalCourseList({ courses }: PersonalCourseListProps): JSX.Element {
  if (courses.length === 0) {
    return (
      <div className='border-default-200/60 bg-content2/20 flex flex-col items-center justify-center rounded-3xl border border-dashed py-16 text-center backdrop-blur-md'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand'>
          <BookOpen className='size-8' />
        </div>
        <h4 className='mt-5 text-xl font-bold text-foreground'>No courses yet</h4>
        <p className='mt-2 max-w-sm text-sm text-muted-foreground'>
          You haven&apos;t enrolled in any courses. Discover something new and start learning!
        </p>
        <Link
          className='mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 transition-all hover:scale-105 hover:bg-brand/95 active:scale-95'
          href={'/courses' as Route}
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className={courseGridClass}>
      {courses.map(({ course, progressPercentage, status }) => {
        const imageUrl = resolveThumbnailUrl(course.thumbnailFileName);
        const isCompleted = status === 'COMPLETED';

        return (
          <div
            key={course.id}
            className={cn(
              glassCardClass,
              'group h-full transition-all duration-500 hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/5'
            )}
          >
            {/* Thumbnail */}
            <div className='bg-default-100 relative aspect-video w-full overflow-hidden'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className='h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105'
                alt={course.title}
                src={imageUrl}
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-course.jpg';
                }}
              />

              {/* Status Badge Overlays */}
              <div className='absolute top-3 right-3 z-10 flex gap-2'>
                {isCompleted ? (
                  <div className='flex items-center gap-1.5 rounded-full bg-success/90 px-2.5 py-1 text-xs font-semibold text-success-foreground shadow-sm backdrop-blur-md'>
                    <CheckCircle2 className='size-3.5' />
                    Completed
                  </div>
                ) : status === 'IN_PROGRESS' ? (
                  <div className='flex items-center gap-1.5 rounded-full bg-brand/90 px-2.5 py-1 text-xs font-semibold text-brand-foreground shadow-sm backdrop-blur-md'>
                    <BookOpen className='size-3.5' />
                    In Progress
                  </div>
                ) : null}
              </div>
            </div>

            {/* Content */}
            <div className='flex flex-1 flex-col p-5'>
              <h3 className='line-clamp-2 text-lg leading-tight font-bold tracking-tight text-foreground transition-colors group-hover:text-brand'>
                {course.title}
              </h3>

              <div className='flex-1 py-4' />

              {/* Progress */}
              <div className='mt-auto space-y-3'>
                <div className='flex items-end justify-between text-sm font-semibold'>
                  <span className={cn('text-muted-foreground', isCompleted ? 'text-success' : '')}>
                    {isCompleted ? 'Finished' : `${progressPercentage}% Complete`}
                  </span>
                </div>

                <div className='bg-default-100/50 h-2 w-full overflow-hidden rounded-full'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-1000 ease-in-out',
                      isCompleted ? 'bg-success' : 'bg-brand'
                    )}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Link Overlay */}
            <Link
              className='absolute inset-0 z-20 rounded-2xl focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none'
              href={`/learner/dashboard/learn/${course.id}` as Route}
              aria-label={`Continue learning ${course.title}`}
            />
          </div>
        );
      })}
    </div>
  );
}
