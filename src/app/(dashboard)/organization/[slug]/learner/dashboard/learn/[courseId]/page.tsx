import { LearnRedirectView } from '@/features/dashboard/organization/learner/learn/learn-page';

type Props = {
  params: Promise<{ courseId: string; slug: string }>;
};

export default async function LearnerLearnRedirectPage(props: Props) {
  const { courseId, slug } = await props.params;
  await LearnRedirectView({ courseId, slug });
  return null;
}
