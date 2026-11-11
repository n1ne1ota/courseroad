import type { Metadata } from 'next';

import { StaffDashboardChart } from '@/features/dashboard/platform/staff/dashboard-chart';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

export const metadata: Metadata = {
  description: 'Staff analytics and moderation overview',
  title: 'Analytics | Staff'
};

export default function StaffAnalyticsPage() {
  return (
    <DashboardPlatformLayout role='staff' title='Analytics'>
      <div className='flex-1 space-y-6 p-8 pt-6'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Moderation Analytics</h2>
            <p className='mt-1 text-sm text-muted-foreground'>Detailed breakdown of moderation queue activities.</p>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-full'>
            <StaffDashboardChart />
          </div>
        </div>
      </div>
    </DashboardPlatformLayout>
  );
}
