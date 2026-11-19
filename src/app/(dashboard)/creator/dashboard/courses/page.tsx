import type { JSX } from 'react';
import { Suspense } from 'react';

import { loadCreatorDashboardCoursesPage } from '@/features/course/server/loaders/platform-creator-courses';
import {
  InstructorCourseManager,
  InstructorCourseManagerHeader
} from '@/features/dashboard/platform/creator/instructor-course-manager';
import { InstructorCourseManagerSkeleton } from '@/features/dashboard/platform/creator/instructor-course-manager-skeleton';
import { readForPage } from '@/server/auth/page-access';

async function AuthoredCourses() {
  const { courses } = await readForPage(() => loadCreatorDashboardCoursesPage());
  return <InstructorCourseManager courses={courses} />;
}

export default function CreatorDashboardCoursesPage(): JSX.Element {
  return (
    <>
      <InstructorCourseManagerHeader />
      <Suspense fallback={<InstructorCourseManagerSkeleton />}>
        <AuthoredCourses />
      </Suspense>
    </>
  );
}
