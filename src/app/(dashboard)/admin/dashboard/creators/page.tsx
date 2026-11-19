import type { Metadata } from 'next';

import { AdminDashboardCards } from '@/features/dashboard/platform/admin/dashboard-cards';
import { AdminDashboardChart } from '@/features/dashboard/platform/admin/dashboard-chart';

export const metadata: Metadata = {
  description: 'Manage creators',
  title: 'Admin Creators'
};

export default function AdminCreatorsPage() {
  return (
    <>
      <AdminDashboardCards />
      <AdminDashboardChart />
    </>
  );
}
