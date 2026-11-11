import type { Metadata } from 'next';

import { AdminDashboardCards } from '@/features/dashboard/platform/admin/dashboard-cards';
import { AdminDashboardChart } from '@/features/dashboard/platform/admin/dashboard-chart';
import { AdminDashboardTable } from '@/features/dashboard/platform/admin/dashboard-table';
import { dashboardMockData } from '@/features/dashboard/shared/data/dashboard-data';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

export const metadata: Metadata = {
  description: 'Manage courses',
  title: 'Admin Courses'
};

export default function AdminCoursesPage() {
  return (
    <DashboardPlatformLayout role='admin' title='Courses'>
      <AdminDashboardCards />
      <div className='px-4 lg:px-6'>
        <AdminDashboardChart />
      </div>
      <AdminDashboardTable data={dashboardMockData} />
    </DashboardPlatformLayout>
  );
}
