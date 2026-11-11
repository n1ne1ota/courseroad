import type { Metadata } from 'next';

import { AdminDashboardCards } from '@/features/dashboard/platform/admin/dashboard-cards';
import { AdminDashboardChart } from '@/features/dashboard/platform/admin/dashboard-chart';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

export const metadata: Metadata = {
  description: 'Admin dashboard overview',
  title: 'Dashboard'
};

export default function AdminDashboardPage() {
  return (
    <DashboardPlatformLayout role='admin' title='Dashboard'>
      <AdminDashboardCards />
      <div className='px-4 lg:px-6'>
        <AdminDashboardChart />
      </div>
    </DashboardPlatformLayout>
  );
}
