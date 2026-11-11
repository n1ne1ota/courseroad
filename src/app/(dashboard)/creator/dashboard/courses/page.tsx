import type { JSX } from 'react';

import { loadCreatorDashboardCoursesPage } from '@/features/course/server/loaders/platform-creator-courses';
import { InstructorCourseManager } from '@/features/dashboard/platform/creator/instructor-course-manager';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';
import { readForPage } from '@/server/auth/page-access';

export default async function CreatorDashboardCoursesPage(): Promise<JSX.Element> {
  const { courses } = await readForPage(() => loadCreatorDashboardCoursesPage());

  return (
    <DashboardPlatformLayout role='creator' title='My Authored Courses'>
      <div className='flex flex-col gap-6'>
        <InstructorCourseManager courses={courses} />
      </div>
    </DashboardPlatformLayout>
  );
}
