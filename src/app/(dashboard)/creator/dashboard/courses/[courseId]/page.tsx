import { Suspense } from 'react';

import { CourseEditor } from '@/features/course/components/course-editor';
import { CourseEditorSkeleton } from '@/features/course/components/course-editor-skeleton';
import { loadPlatformCreatorCourseEditor } from '@/features/course/server/loaders/platform-creator-course-editor';
import { readForPage } from '@/server/auth/page-access';

type PageProps = { params: Promise<{ courseId: string }> };

async function PlatformCourseEditor({ params }: PageProps) {
  const { courseId } = await params;
  const { course } = await readForPage(() => loadPlatformCreatorCourseEditor(courseId));
  return <CourseEditor course={course} scope='platform' />;
}

export default function PlatformCourseEditorPage({ params }: PageProps) {
  return (
    <>
      <Suspense fallback={<CourseEditorSkeleton />}>
        <PlatformCourseEditor params={params} />
      </Suspense>
    </>
  );
}
