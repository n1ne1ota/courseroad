import { LearnerQuizTakeView } from '@/features/dashboard/organization/learner/quizzes/quiz-detail-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

type PageProps = {
  params: Promise<{ quizId: string }>;
};

export default async function LearnerQuizTakePage({ params }: PageProps) {
  const { quizId } = await params;
  return (
    <DashboardOrganizationLayout role='learner' title='Take Quiz'>
      <LearnerQuizTakeView quizId={quizId} />
    </DashboardOrganizationLayout>
  );
}
