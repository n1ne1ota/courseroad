import type { JSX } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { BookOpen } from 'lucide-react';

import { resolveThumbnailUrl } from '@/lib/api/cdn-url';

export interface CourseCardProps {
  creatorName?: string | null;
  id: string;
  price?: number | null;
  shortDescription?: string | null;
  slug: string;
  thumbnailFileName?: string | null;
  title: string;
}

export function CourseCard({
  creatorName,
  id,
  price,
  shortDescription,
  slug: _slug,
  thumbnailFileName,
  title
}: CourseCardProps): JSX.Element {
  const imageUrl = resolveThumbnailUrl(thumbnailFileName);

  const displayPrice =
    price !== null && price !== undefined ? (price === 0 ? 'Free' : `$${(price / 100).toFixed(2)}`) : 'Free';

  return (
    <div className='group border-default-200/50 relative flex h-full flex-col overflow-hidden rounded-2xl border bg-background/50 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-primary/10'>
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

        {/* Price Badge */}
        <div className='absolute top-3 right-3 z-10 flex gap-2'>
          <div className='flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md'>
            {displayPrice}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='flex flex-1 flex-col p-5'>
        <h3 className='line-clamp-2 text-lg leading-tight font-bold tracking-tight text-foreground transition-colors group-hover:text-primary'>
          {title}
        </h3>

        {shortDescription && <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>{shortDescription}</p>}

        <div className='flex-1' />

        {/* Footer */}
        <div className='mt-5 flex items-center justify-between text-sm'>
          {creatorName && <span className='font-medium text-foreground opacity-80'>by {creatorName}</span>}
          <span className='flex items-center gap-1.5 font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100'>
            View Course <BookOpen className='size-4' />
          </span>
        </div>
      </div>

      <Link
        className='absolute inset-0 z-20 rounded-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none'
        href={`/courses/${id}` as Route}
        aria-label={`View course ${title}`}
      />
    </div>
  );
}
