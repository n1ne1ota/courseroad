import { CreatorDashboardView } from '@/features/dashboard/organization/creator/dashboard-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

export default async function RoleDashboardPage() {
  return (
    <DashboardOrganizationLayout title='Dashboard'>
      <CreatorDashboardView />
    </DashboardOrganizationLayout>
  );
}
