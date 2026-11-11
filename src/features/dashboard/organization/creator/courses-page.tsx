import 'server-only';

import type { JSX } from 'react';

import Link from 'next/link';

import { CreatorCourseModal } from '@/features/course/components/course-modal';
import { loadCreatorCoursesView } from '@/features/course/server/loaders/organization-creator-courses';
import { readForPage } from '@/server/auth/page-access';

import type { Course } from '@/features/course/types';

type CreatorCoursesViewProps = {
  orgSlug: string;
  role: string;
};

export async function CreatorCoursesView({ orgSlug, role }: CreatorCoursesViewProps): Promise<JSX.Element> {
  const { courses, orgRoutes } = await readForPage(() => loadCreatorCoursesView({ orgSlug, role }));

  return (
    <div className='flex flex-col px-4 py-8 lg:px-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Courses</h1>
          <p className='text-muted-foreground'>Manage your courses.</p>
        </div>
        <CreatorCourseModal />
      </div>
      <div className='mt-6 rounded-md border'>
        <div className='p-6'>
          {courses.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8 text-center'>
              <h3 className='text-lg font-medium'>No courses found</h3>
              <p className='mt-2 text-sm text-muted-foreground'>You haven&apos;t created any courses yet.</p>
            </div>
          ) : (
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {courses.map((course: Course) => (
                <Link
                  key={course.id}
                  className='group flex flex-col justify-between rounded-lg border p-6 transition-colors hover:border-primary'
                  href={orgRoutes.courseEdit(course.id)}
                >
                  <div>
                    <h3 className='font-semibold tracking-tight'>{course.title}</h3>
                    <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
                      {course.shortDescription || course.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className='mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100'>
                    Edit Course &rarr;
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
