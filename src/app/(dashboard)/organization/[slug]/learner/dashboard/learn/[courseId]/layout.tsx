import { LearnLayout } from '@/features/dashboard/organization/learner/learn/learn-layout';

type Props = {
  children: React.ReactNode;
  params: Promise<{ courseId: string; slug: string }>;
};

export default async function LearnerLearnLayout(props: Props) {
  const { courseId, slug } = await props.params;
  return (
    <LearnLayout courseId={courseId} slug={slug}>
      {props.children}
    </LearnLayout>
  );
}
