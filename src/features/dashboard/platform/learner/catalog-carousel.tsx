'use client';

import type { JSX } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { ArrowRight, BookOpen, Star } from 'lucide-react';

import { resolveThumbnailUrl } from '@/lib/api/cdn-url';

export interface CatalogCourse {
  category: string | null;
  id: string;
  level: string | null;
  price: number | null;
  shortDescription: string | null;
  thumbnailFileName: string | null;
  title: string;
}

interface CatalogCarouselProps {
  courses: CatalogCourse[];
}

export function CatalogCarousel({ courses }: CatalogCarouselProps): JSX.Element {
  if (courses.length === 0) {
    return <></>;
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-2xl font-bold tracking-tight text-foreground'>Trending Courses</h3>
          <p className='mt-1 text-sm text-muted-foreground'>Expand your skillset with these top-rated options.</p>
        </div>
        <Link
          className='group flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80'
          href={'/courses' as Route}
        >
          View all
          <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
        </Link>
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {courses.slice(0, 4).map(course => {
          const imageUrl = resolveThumbnailUrl(course.thumbnailFileName);
          const displayPrice =
            course.price !== null && course.price !== undefined
              ? course.price === 0
                ? 'Free'
                : `$${(course.price / 100).toFixed(2)}`
              : 'Free';

          return (
            <div
              key={course.id}
              className='group border-default-200/50 relative flex h-full flex-col overflow-hidden rounded-2xl border bg-background/30 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
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

                {/* Badge Overlay */}
                <div className='absolute top-3 left-3 z-10 flex gap-2'>
                  <div className='flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold tracking-wider text-foreground uppercase shadow-sm backdrop-blur-md'>
                    <Star className='size-3 fill-warning text-warning' />
                    Popular
                  </div>
                </div>

                {/* Price Tag Overlay */}
                <div className='absolute right-3 bottom-3 z-10'>
                  <div className='rounded-lg bg-background/95 px-2.5 py-1 text-xs font-extrabold text-foreground shadow-md backdrop-blur-sm'>
                    {displayPrice}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className='flex flex-1 flex-col p-5'>
                <div className='flex items-center gap-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
                  <span>{course.category || 'General'}</span>
                  <span>&bull;</span>
                  <span>{course.level || 'Beginner'}</span>
                </div>

                <h4 className='mt-2 line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-primary'>
                  {course.title}
                </h4>

                <p className='mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
                  {course.shortDescription ||
                    'Learn the foundational concepts and practical skills in this hands-on course.'}
                </p>

                <div className='flex-1 py-4' />

                {/* Footer Action */}
                <div className='mt-auto flex items-center justify-between border-t border-border/40 pt-4'>
                  <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <BookOpen className='size-3.5' />
                    <span>View Details</span>
                  </div>
                  <div className='flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:translate-x-1'>
                    <ArrowRight className='size-4' />
                  </div>
                </div>
              </div>

              {/* Link Overlay */}
              <Link
                className='absolute inset-0 z-20 rounded-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none'
                href={`/courses/${course.id}` as Route}
                aria-label={`View ${course.title} details`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
