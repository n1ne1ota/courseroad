import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils/cn';

import { CreatorCourseModal } from '@/features/course/components/course-modal';
import { loadCreatorCoursesView } from '@/features/course/server/loaders/organization-creator-courses';
import { DashboardContentPanel, DashboardPageShell } from '@/features/dashboard/shared/ui/dashboard-page-shell';
import { listCardClass, listCardGridClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';
import { ListCardGridSkeleton } from '@/features/dashboard/shared/ui/list-card-grid-skeleton';
import { readForPage } from '@/server/auth/page-access';

import type { Course } from '@/features/course/types/course-types';

type CreatorCoursesViewProps = {
  orgSlug: string;
  role: string;
};

async function CreatorCourseList({ orgSlug, role }: CreatorCoursesViewProps): Promise<JSX.Element> {
  const { courses, orgRoutes } = await readForPage(() => loadCreatorCoursesView({ orgSlug, role }));

  if (courses.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center'>
        <h3 className='text-lg font-medium'>No courses found</h3>
        <p className='mt-2 text-sm text-muted-foreground'>You haven&apos;t created any courses yet.</p>
      </div>
    );
  }

  return (
    <div className={listCardGridClass}>
      {courses.map((course: Course) => (
        <Link
          key={course.id}
          className={cn(listCardClass, 'group transition-colors hover:border-brand')}
          href={orgRoutes.courseEdit(course.id)}
        >
          <div>
            <h3 className='font-semibold tracking-tight'>{course.title}</h3>
            <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
              {course.shortDescription || course.description || 'No description provided.'}
            </p>
          </div>
          <div className='mt-4 flex items-center text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100'>
            Edit Course &rarr;
          </div>
        </Link>
      ))}
    </div>
  );
}

/** Static heading and panel stream first; the course list suspends on its own skeleton. */
export function CreatorCoursesView({ orgSlug, role }: CreatorCoursesViewProps): JSX.Element {
  return (
    <DashboardPageShell actions={<CreatorCourseModal />} description='Manage your courses.' title='Courses'>
      <DashboardContentPanel>
        <Suspense fallback={<ListCardGridSkeleton />}>
          <CreatorCourseList orgSlug={orgSlug} role={role} />
        </Suspense>
      </DashboardContentPanel>
    </DashboardPageShell>
  );
}
