import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';
import { MembersView } from '@/features/dashboard/shared/views/members-view';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RoleMembersPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <DashboardOrganizationLayout title='Members'>
      <MembersView orgSlug={slug} />
    </DashboardOrganizationLayout>
  );
}
