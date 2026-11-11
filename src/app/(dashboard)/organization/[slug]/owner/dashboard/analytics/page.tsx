import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';
import { AnalyticsView } from '@/features/dashboard/shared/views/analytics-view';

export default function RoleAnalyticsPage() {
  return (
    <DashboardOrganizationLayout title='Analytics'>
      <AnalyticsView />
    </DashboardOrganizationLayout>
  );
}
