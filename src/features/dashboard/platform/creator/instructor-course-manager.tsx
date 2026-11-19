'use client';

import type { JSX } from 'react';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import {
  Badge,
  buttonVariants,
  Card,
  CardContent,
  CardFooter,
  CardInfo,
  CardMedia,
  CardMeta
} from '@courseroad/kurume-ui';

import { BookOpen, GraduationCap, Pencil } from 'lucide-react';

import { resolveCdnUrl } from '@/lib/api/cdn-url';

import { CreatorCourseModal } from '@/features/course/components/course-modal';
import { workspaceGridClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';

import type { CourseStatus } from '@/features/course/schemas/course-schemas';

export interface AuthoredCourse {
  _count: {
    enrollments: number;
  };
  category: string | null;
  createdAt: Date;
  fileKey: string | null;
  id: string;
  level: string | null;
  price: number | null;
  status: CourseStatus;
  thumbnailFileName: string | null;
  title: string;
}

interface InstructorCourseManagerProps {
  courses: AuthoredCourse[];
}

const statusBadge = {
  Archived: { variant: 'secondary' },
  Draft: { color: 'warning' },
  Published: { color: 'success' }
} as const;
const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const createdDateFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Section heading and create action; no data dependency, so the page renders it in the static shell. */
export function InstructorCourseManagerHeader(): JSX.Element {
  return (
    <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>Authored Courses</h1>
        <p className='text-sm text-muted-foreground'>Manage your drafts and published marketplace courses.</p>
      </div>
      <CreatorCourseModal scope='platform' triggerLabel='Create course' />
    </div>
  );
}

export function InstructorCourseManager({ courses }: InstructorCourseManagerProps): JSX.Element {
  if (!courses.length) {
    return (
      <div className='flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center'>
        <div className='mb-4 grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground'>
          <BookOpen className='size-5' aria-hidden='true' />
        </div>
        <h2 className='font-semibold text-foreground'>No authored courses yet</h2>
        <p className='mt-1 mb-5 text-sm text-muted-foreground'>Create a course to start building your curriculum.</p>
        <CreatorCourseModal scope='platform' triggerLabel='Create course' />
      </div>
    );
  }

  return (
    <div className={workspaceGridClass}>
      {courses.map(course => {
        const displayPrice = course.price ? priceFormatter.format(course.price) : 'Free';
        const createdAt = new Date(course.createdAt);
        const cover = course.fileKey || course.thumbnailFileName;
        const coverUrl = cover && (/^https?:\/\//i.test(cover) ? cover : resolveCdnUrl(cover));
        const category =
          course.category === 'health-fitness' ? 'Health & Fitness' : course.category?.replaceAll('-', ' ');

        return (
          <Card
            key={course.id}
            className='min-w-0 hover:shadow-md motion-safe:transition-shadow'
            role='article'
            size='sm'
          >
            <CardMedia placeholder={<BookOpen aria-hidden='true' />}>
              {coverUrl && (
                <Image
                  key={coverUrl}
                  className='object-cover'
                  fill
                  unoptimized
                  alt=''
                  src={coverUrl}
                  onError={event => {
                    event.currentTarget.hidden = true;
                  }}
                />
              )}
            </CardMedia>

            <CardContent className='flex flex-1 flex-col gap-stack'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <Badge size='sm' {...statusBadge[course.status]}>
                  {course.status}
                </Badge>
                <time className='text-xs text-muted-foreground' dateTime={createdAt.toISOString()}>
                  Created {createdDateFormatter.format(createdAt)}
                </time>
              </div>
              <h2 className='line-clamp-2 text-lg leading-tight font-semibold tracking-tight wrap-break-word'>
                {course.title}
              </h2>
              {(category || course.level) && (
                <div className='flex flex-wrap items-center gap-2'>
                  {category && (
                    <Badge className='max-w-full capitalize' size='sm' variant='outline'>
                      <span className='truncate' title={category}>
                        {category}
                      </span>
                    </Badge>
                  )}
                  {course.level && (
                    <Badge size='sm' variant='outline'>
                      {course.level}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <CardInfo>
                <span className='tabular-nums'>{displayPrice}</span>
                <CardMeta>
                  <GraduationCap aria-hidden='true' />
                  {course._count.enrollments.toLocaleString('en-US')} enrolled
                </CardMeta>
              </CardInfo>
              <Link
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
                href={`/creator/dashboard/courses/${course.id}` as Route}
                aria-label={`Edit course: ${course.title}`}
              >
                <Pencil aria-hidden='true' />
                Edit course
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
