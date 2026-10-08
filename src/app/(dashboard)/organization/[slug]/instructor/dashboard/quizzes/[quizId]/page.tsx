import { CreatorQuizEditView } from '@/features/dashboard/organization/creator/quiz-editor-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

type PageProps = {
  params: Promise<{ slug: string; quizId: string }>;
};

export default async function RoleQuizEditPage({ params }: PageProps) {
  const { quizId, slug } = await params;
  return (
    <DashboardOrganizationLayout title={quizId === 'new' ? 'Create Quiz' : 'Edit Quiz'}>
      <CreatorQuizEditView orgSlug={slug} quizId={quizId} role='instructor' />
    </DashboardOrganizationLayout>
  );
}
