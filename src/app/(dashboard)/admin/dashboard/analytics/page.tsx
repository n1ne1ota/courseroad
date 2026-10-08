import type { Metadata } from 'next';

import { AdminDashboardChart } from '@/features/dashboard/platform/admin/dashboard-chart';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

export const metadata: Metadata = {
  description: 'Admin platform analytics overview',
  title: 'Analytics | Admin'
};

export default function AdminAnalyticsPage() {
  return (
    <DashboardPlatformLayout role='admin' title='Analytics'>
      <div className='flex-1 space-y-6 p-8 pt-6'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Platform Analytics</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Detailed breakdown of platform visitors and signups over time.
            </p>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-full'>
            <AdminDashboardChart />
          </div>
        </div>
      </div>
    </DashboardPlatformLayout>
  );
}
