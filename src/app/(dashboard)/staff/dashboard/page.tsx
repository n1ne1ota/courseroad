import type { Metadata } from 'next';

import { StaffDashboardCards } from '@/features/dashboard/platform/staff/dashboard-cards';
import { StaffDashboardChart } from '@/features/dashboard/platform/staff/dashboard-chart';

export const metadata: Metadata = {
  description: 'Staff dashboard for content moderation and management.',
  title: 'Staff Dashboard'
};

export default function StaffDashboardPage() {
  return (
    <>
      <StaffDashboardCards />
      <StaffDashboardChart />
    </>
  );
}
