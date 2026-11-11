'use client';

import type { JSX } from 'react';

import Link from 'next/link';

import { Button } from '@courseroad/iota-ui';
import { BookOpen, GraduationCap, LayoutGrid, Plus, Tag } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

export interface AuthoredCourse {
  _count: {
    enrollments: number;
  };
  category: string | null;
  createdAt: Date;
  id: string;
  level: string | null;
  price: number | null;
  slug: string;
  status: string;
  thumbnailFileName: string | null;
  title: string;
}

interface InstructorCourseManagerProps {
  courses: AuthoredCourse[];
}

export function InstructorCourseManager({ courses }: InstructorCourseManagerProps): JSX.Element {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-lg font-bold text-foreground'>Authored Courses</h3>
          <p className='text-sm text-muted-foreground'>
            Manage your direct-to-consumer courses published on the marketplace.
          </p>
        </div>
        <Button
          className='flex items-center gap-2 self-start rounded-xl sm:self-auto'
          color='primary'
          onPress={() =>
            alert('Course creation is managed via platform administration or will be available in the next release.')
          }
        >
          <Plus className='size-4' />
          <span>Create New Course</span>
        </Button>
      </div>

      {courses.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {courses.map(course => {
            const displayPrice = course.price !== null ? `$${(course.price / 100).toFixed(2)}` : 'Free';
            const displayDate = new Date(course.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={course.id}
                className='border-default-200/50 flex flex-col justify-between rounded-3xl border bg-background/30 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-background/40 hover:shadow-md'
              >
                <div>
                  <div className='mb-4 flex items-center justify-between gap-2'>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase',
                        course.status === 'Published' && 'bg-success/15 text-success',
                        course.status === 'Draft' && 'bg-warning/15 text-warning',
                        course.status === 'Archived' && 'bg-default-200 text-muted-foreground'
                      )}
                    >
                      {course.status}
                    </span>
                    <span className='text-xs text-muted-foreground'>{displayDate}</span>
                  </div>

                  <h4 className='mb-2 line-clamp-2 min-h-[3rem] text-base font-bold text-foreground'>{course.title}</h4>

                  <div className='mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                    {course.category && (
                      <span className='inline-flex items-center gap-1 rounded-lg bg-muted/30 px-2 py-0.5'>
                        <Tag className='size-3' />
                        {course.category}
                      </span>
                    )}
                    {course.level && (
                      <span className='inline-flex items-center gap-1 rounded-lg bg-muted/30 px-2 py-0.5'>
                        <LayoutGrid className='size-3' />
                        {course.level}
                      </span>
                    )}
                  </div>
                </div>

                <div className='border-default-200/50 mt-auto flex items-center justify-between border-t pt-4'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-1 text-sm font-semibold text-foreground'>
                      <GraduationCap className='size-4 text-primary' />
                      <span>{course._count.enrollments}</span>
                    </div>
                    <span className='text-sm font-bold text-foreground'>{displayPrice}</span>
                  </div>

                  <Link
                    href='#'
                    onClick={e => {
                      e.preventDefault();
                      alert('Course content editing will be linked in the next phase.');
                    }}
                  >
                    <span className='cursor-pointer text-sm font-semibold text-primary hover:underline'>
                      Manage Contents
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='border-default-200/50 flex flex-col items-center justify-center rounded-3xl border bg-background/30 p-16 text-center backdrop-blur-md'>
          <div className='mb-4 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <BookOpen className='size-7' />
          </div>
          <h5 className='text-base font-bold text-foreground'>No authored courses yet</h5>
          <p className='mt-1 mb-6 max-w-sm text-sm text-muted-foreground'>
            You haven&apos;t created any B2C courses on Courseroad yet. Launch your first course to share your
            knowledge!
          </p>
          <Button
            className='flex items-center gap-2 rounded-xl'
            color='primary'
            onPress={() =>
              alert('Course creation is managed via platform administration or will be available in the next release.')
            }
          >
            <Plus className='size-4' />
            <span>Create a Course</span>
          </Button>
        </div>
      )}
    </div>
  );
}
