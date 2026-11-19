import type { Metadata } from 'next';

import { AdminDashboardCards } from '@/features/dashboard/platform/admin/dashboard-cards';
import { AdminDashboardChart } from '@/features/dashboard/platform/admin/dashboard-chart';

export const metadata: Metadata = {
  description: 'Admin dashboard overview',
  title: 'Dashboard'
};

export default function AdminDashboardPage() {
  return (
    <>
      <AdminDashboardCards />
      <AdminDashboardChart />
    </>
  );
}
