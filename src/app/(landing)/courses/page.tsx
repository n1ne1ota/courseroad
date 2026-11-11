import type { Metadata } from 'next';

import { Library, Sparkles } from 'lucide-react';

import { CourseCard } from '@/features/course/components/course-card';
import { loadCoursesPage } from '@/features/course/server/loaders/public-courses';
import { readForPage } from '@/server/auth/page-access';

export default async function CoursesPage() {
  const { publishedCourses } = await readForPage(() => loadCoursesPage());

  return (
    <div className='relative flex flex-col gap-8 px-4 pt-10 pb-20 lg:px-6'>
      <div className='flex flex-col items-center justify-center text-center'>
        <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 backdrop-blur-md'>
          <Sparkles className='size-4 text-primary' />
          <span className='text-xs font-semibold tracking-wider text-primary uppercase'>Course Catalog</span>
        </div>
        <h1 className='text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl'>
          Level up your{' '}
          <span className='bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>skills</span>
        </h1>
        <p className='mt-4 max-w-2xl text-lg text-muted-foreground'>
          Browse our collection of expert-led courses and start your learning journey today.
        </p>
      </div>

      <div className='mx-auto mt-10 w-full max-w-7xl'>
        {publishedCourses.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {publishedCourses.map(course => {
              const creator = course.creator;
              const creatorName = creator?.firstName
                ? `${creator.firstName} ${creator.lastName || ''}`.trim()
                : 'Instructor';
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
        ) : (
          <div className='border-default-300 flex flex-col items-center justify-center rounded-3xl border border-dashed bg-background/50 py-24 text-center'>
            <Library className='mb-4 size-12 text-muted-foreground opacity-50' />
            <h3 className='text-xl font-semibold'>No courses available yet</h3>
            <p className='mt-2 text-muted-foreground'>Check back later as new courses are published frequently.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  alternates: { canonical: '/courses' },
  description: 'Browse courses across topics to accelerate your learning.',
  title: 'Courses'
};
