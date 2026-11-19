import { Suspense } from 'react';

import { LessonPageSkeleton } from '@/features/course/components/learn-skeletons';
import { LessonView } from '@/features/dashboard/organization/learner/learn/lesson-page';

type Props = {
  params: Promise<{ courseId: string; lessonId: string; slug: string }>;
};

async function LessonContent({ params }: Props) {
  const { courseId, lessonId, slug } = await params;
  return <LessonView courseId={courseId} lessonId={lessonId} slug={slug} />;
}

export default function LearnerLessonPage(props: Props) {
  return (
    <Suspense fallback={<LessonPageSkeleton />}>
      <LessonContent params={props.params} />
    </Suspense>
  );
}
