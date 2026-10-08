import type { Metadata } from 'next';

import { StaffDashboardCards } from '@/features/dashboard/platform/staff/dashboard-cards';
import { StaffDashboardChart } from '@/features/dashboard/platform/staff/dashboard-chart';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

export const metadata: Metadata = {
  description: 'Staff dashboard for content moderation and management.',
  title: 'Staff Dashboard'
};

export default function StaffDashboardPage() {
  return (
    <DashboardPlatformLayout role='staff' title='Dashboard'>
      <StaffDashboardCards />
      <div className='px-4 lg:px-6'>
        <StaffDashboardChart />
      </div>
    </DashboardPlatformLayout>
  );
}
