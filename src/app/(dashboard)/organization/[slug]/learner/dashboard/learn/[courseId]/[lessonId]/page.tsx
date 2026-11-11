import { LessonView } from '@/features/dashboard/organization/learner/learn/lesson-page';

type Props = {
  params: Promise<{ courseId: string; lessonId: string; slug: string }>;
};

export default async function LearnerLessonPage(props: Props) {
  const { courseId, lessonId, slug } = await props.params;
  return <LessonView courseId={courseId} lessonId={lessonId} slug={slug} />;
}
