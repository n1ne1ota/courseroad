import { CreatorCourseEditView } from '@/features/dashboard/organization/creator/course-editor-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

type PageProps = {
  params: Promise<{ courseId: string; slug: string }>;
};

export default async function RoleCourseEditPage({ params }: PageProps) {
  const { courseId, slug } = await params;
  return (
    <DashboardOrganizationLayout title='Edit Course'>
      <CreatorCourseEditView courseId={courseId} orgSlug={slug} />
    </DashboardOrganizationLayout>
  );
}
