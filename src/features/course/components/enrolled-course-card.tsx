'use client';

import type { JSX } from 'react';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BookOpen, CheckCircle2 } from 'lucide-react';

import { resolveThumbnailUrl } from '@/lib/api/cdn-url';
import { createOrgRoutes, extractOrgSlug, getActiveRoleFromPath } from '@/lib/routes/org';
import { cn } from '@/lib/utils/cn';

export interface EnrolledCourseCardProps {
  courseId: string;
  id: string;
  progressPercentage: number;
  slug: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  thumbnailFileName?: string | null;
  title: string;
}

export function EnrolledCourseCard({
  courseId,
  id: _id,
  progressPercentage,
  slug: _slug,
  status,
  thumbnailFileName,
  title
}: EnrolledCourseCardProps): JSX.Element {
  const pathname = usePathname();
  const orgSlug = extractOrgSlug(pathname);
  const activeRole = getActiveRoleFromPath(pathname) ?? 'learner';
  const orgRoutes = orgSlug ? createOrgRoutes(orgSlug, activeRole) : null;

  // Construct image URL or fallback
  const imageUrl = resolveThumbnailUrl(thumbnailFileName);

  const isCompleted = status === 'COMPLETED';
  const learnUrl = orgRoutes ? orgRoutes.learn(courseId) : ('#' as Route);

  return (
    <div className='group border-default-200/50 relative flex h-full animate-in flex-col overflow-hidden rounded-2xl border bg-background/50 shadow-sm backdrop-blur-md transition-all duration-500 fade-in slide-in-from-bottom-4 hover:-translate-y-1 hover:border-primary/50 hover:shadow-primary/10'>
      {/* Thumbnail Section */}
      <div className='bg-default-100 relative aspect-video w-full overflow-hidden'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className='h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105'
          alt={title}
          src={imageUrl}
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder-course.jpg';
          }}
        />

        {/* Status Badge Overlays */}
        <div className='absolute top-3 right-3 z-10 flex gap-2'>
          {isCompleted && (
            <div className='flex items-center gap-1.5 rounded-full bg-success/90 px-2.5 py-1 text-xs font-medium text-success-foreground shadow-sm backdrop-blur-md'>
              <CheckCircle2 className='size-3.5' />
              Completed
            </div>
          )}
          {status === 'IN_PROGRESS' && (
            <div className='flex items-center gap-1.5 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm backdrop-blur-md'>
              <BookOpen className='size-3.5' />
              In Progress
            </div>
          )}
        </div>

        {/* Gradient Overlay for Text Readability if needed */}
        <div className='absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
      </div>

      {/* Content Section */}
      <div className='flex flex-1 flex-col p-5'>
        <h3 className='line-clamp-2 text-lg leading-tight font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary'>
          {title}
        </h3>

        {/* Spacer */}
        <div className='flex-1 py-4' />

        {/* Progress Section */}
        <div className='mt-auto space-y-3'>
          <div className='flex items-end justify-between text-sm font-medium'>
            <span className={cn('text-muted-foreground', isCompleted ? 'text-success' : '')}>
              {isCompleted ? 'Finished' : `${progressPercentage}% Complete`}
            </span>
          </div>

          {/* Custom Native Progress Bar */}
          <div className='bg-default-100 h-2 w-full overflow-hidden rounded-full'>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 ease-in-out',
                isCompleted ? 'bg-success' : 'bg-primary'
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clickable Overlay */}
      <Link
        className='absolute inset-0 z-20 rounded-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none'
        href={learnUrl}
        aria-label={`Continue learning ${title}`}
      />
    </div>
  );
}
