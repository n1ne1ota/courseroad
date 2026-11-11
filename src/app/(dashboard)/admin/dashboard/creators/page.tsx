import type { Metadata } from 'next';

import { AdminDashboardCards } from '@/features/dashboard/platform/admin/dashboard-cards';
import { AdminDashboardChart } from '@/features/dashboard/platform/admin/dashboard-chart';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

export const metadata: Metadata = {
  description: 'Manage creators',
  title: 'Admin Creators'
};

export default function AdminCreatorsPage() {
  return (
    <DashboardPlatformLayout role='admin' title='Creators'>
      <AdminDashboardCards />
      <div className='px-4 lg:px-6'>
        <AdminDashboardChart />
      </div>
    </DashboardPlatformLayout>
  );
}
