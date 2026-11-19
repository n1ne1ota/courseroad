import type { Metadata } from 'next';

import { AdminDashboardCards } from '@/features/dashboard/platform/admin/dashboard-cards';
import { AdminDashboardChart } from '@/features/dashboard/platform/admin/dashboard-chart';
import { AdminDashboardTable } from '@/features/dashboard/platform/admin/dashboard-table';
import { dashboardMockData } from '@/features/dashboard/shared/mock/dashboard-data';

export const metadata: Metadata = {
  description: 'Manage courses',
  title: 'Admin Courses'
};

export default function AdminCoursesPage() {
  return (
    <>
      <AdminDashboardCards />
      <AdminDashboardChart />
      <AdminDashboardTable data={dashboardMockData} />
    </>
  );
}
