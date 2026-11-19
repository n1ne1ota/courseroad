import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import { CourseEditor } from '@/features/course/components/course-editor';
import { CourseEditorSkeleton } from '@/features/course/components/course-editor-skeleton';
import { loadCourseEditorFetcher } from '@/features/course/server/loaders/organization-creator-course-editor';
import { readForPage } from '@/server/auth/page-access';

async function CourseEditorFetcher({ courseId, orgSlug }: { courseId: string; orgSlug: string }) {
  const { course } = await readForPage(() => loadCourseEditorFetcher({ courseId, orgSlug }));

  return <CourseEditor course={course} />;
}

export function CreatorCourseEditView({ courseId, orgSlug }: { courseId: string; orgSlug: string }): JSX.Element {
  return (
    <Suspense fallback={<CourseEditorSkeleton />}>
      <CourseEditorFetcher courseId={courseId} orgSlug={orgSlug} />
    </Suspense>
  );
}
