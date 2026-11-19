import { CreatorCoursesView } from '@/features/dashboard/organization/creator/courses-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RoleCoursesPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <DashboardOrganizationLayout title='Courses'>
      <CreatorCoursesView orgSlug={slug} role='creator' />
    </DashboardOrganizationLayout>
  );
}
