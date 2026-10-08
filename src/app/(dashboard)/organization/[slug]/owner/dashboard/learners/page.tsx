import { LearnersView } from '@/features/dashboard/organization/instructor/learners/learners-page';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

export default function RoleLearnersPage() {
  return (
    <DashboardOrganizationLayout title='Learners'>
      <LearnersView />
    </DashboardOrganizationLayout>
  );
}
