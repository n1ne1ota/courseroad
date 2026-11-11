import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { CourseEditor } from '@/features/course/components/course-editor';
import { loadCourseEditorFetcher } from '@/features/course/server/loaders/organization-creator-course-editor';
import { readForPage } from '@/server/auth/page-access';

async function CourseEditorFetcher({ courseId, orgSlug }: { courseId: string; orgSlug: string }) {
  const { course } = await readForPage(() => loadCourseEditorFetcher({ courseId, orgSlug }));

  return <CourseEditor course={course} />;
}

export function CreatorCourseEditView({ courseId, orgSlug }: { courseId: string; orgSlug: string }): JSX.Element {
  return (
    <div className='px-4 lg:px-6'>
      <Suspense fallback={<PageSkeleton />}>
        <CourseEditorFetcher courseId={courseId} orgSlug={orgSlug} />
      </Suspense>
    </div>
  );
}
