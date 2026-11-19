import type { JSX } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { Card, Chip } from '@courseroad/iota-ui';

import { BookOpen } from 'lucide-react';

import { resolveThumbnailUrl } from '@/lib/api/cdn-url';
import { cn } from '@/lib/utils/cn';

import { courseCardClass } from '../lib/course-card-surfaces';

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
    <Card
      className={cn(
        courseCardClass,
        'group transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-brand/50'
      )}
      shadow='md'
      variant='frosted-glass'
    >
      {/* Thumbnail Section */}
      <div className='relative aspect-video w-full overflow-hidden bg-muted'>
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
          <Chip color='default' radius='full' size='sm' variant='soft'>
            {displayPrice}
          </Chip>
        </div>
      </div>

      {/* Content Section */}
      <div className='flex flex-1 flex-col p-5'>
        <h3 className='line-clamp-2 text-lg leading-tight font-semibold tracking-tight text-foreground transition-colors group-hover:text-brand'>
          {title}
        </h3>

        {shortDescription ? (
          <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>{shortDescription}</p>
        ) : null}

        <div className='flex-1' />

        {/* Footer */}
        <div className='mt-5 flex items-center justify-between text-sm'>
          {creatorName ? <span className='font-medium text-foreground/80'>by {creatorName}</span> : <span />}
          <span className='flex items-center gap-1.5 font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100'>
            View Course <BookOpen className='size-4' />
          </span>
        </div>
      </div>

      <Link
        className='absolute inset-0 z-20 rounded-[inherit] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none'
        href={`/courses/${id}` as Route}
        aria-label={`View course ${title}`}
      />
    </Card>
  );
}
