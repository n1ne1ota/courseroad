import { Suspense } from 'react';

import type { Metadata } from 'next';

import { Card } from '@courseroad/iota-ui';

import { Library } from 'lucide-react';

import { PublicPageHeader, PublicPageShell } from '@/components/layout/public-page-shell';

import { CourseCard } from '@/features/course/components/course-card';
import { CourseCatalogSkeleton } from '@/features/course/components/course-card-skeleton';
import { courseCatalogGridClass } from '@/features/course/lib/course-card-surfaces';
import { loadCoursesPage } from '@/features/course/server/loaders/public-courses';
import { readForPage } from '@/server/auth/page-access';

async function CourseCatalog() {
  const { publishedCourses } = await readForPage(() => loadCoursesPage());

  if (publishedCourses.length === 0) {
    return (
      <Card className='items-center py-20 text-center' shadow='sm' variant='frosted-glass'>
        <Library className='mb-4 size-12 text-muted-foreground opacity-50' />
        <h2 className='text-xl font-semibold'>No courses available yet</h2>
        <p className='mt-2 text-muted-foreground'>Check back later as new courses are published frequently.</p>
      </Card>
    );
  }

  return (
    <div className={courseCatalogGridClass}>
      {publishedCourses.map(course => {
        const creator = course.creator;
        const creatorName = creator?.firstName ? `${creator.firstName} ${creator.lastName || ''}`.trim() : 'Instructor';
        return (
          <CourseCard
            key={course.id}
            id={course.id}
            creatorName={creatorName}
            price={course.price}
            shortDescription={course.shortDescription}
            slug={course.slug}
            thumbnailFileName={course.thumbnailFileName}
            title={course.title}
          />
        );
      })}
    </div>
  );
}

/** The hero is static and streams first; only the catalog grid suspends, on a matching card skeleton. */
export default function CoursesPage() {
  return (
    <PublicPageShell>
      <div className='flex flex-col gap-12'>
        <PublicPageHeader
          align='center'
          description='Browse our collection of expert-led courses and start your learning journey today.'
          eyebrow='Courses'
          title='Level up your skills.'
        />

        <Suspense fallback={<CourseCatalogSkeleton />}>
          <CourseCatalog />
        </Suspense>
      </div>
    </PublicPageShell>
  );
}

export const metadata: Metadata = {
  alternates: { canonical: '/courses' },
  description: 'Browse courses across topics to accelerate your learning.',
  title: 'Courses'
};
