import 'server-only';

import type { JSX } from 'react';

import { CreatorDashboardCards } from '@/features/dashboard/organization/creator/analytics-cards';
import { CreatorDashboardChart } from '@/features/dashboard/organization/creator/analytics-chart';
import { CreatorDashboardTable } from '@/features/dashboard/organization/creator/analytics-table';
import { dashboardMockData } from '@/features/dashboard/shared/mock/dashboard-data';

export async function CreatorDashboardView(): Promise<JSX.Element> {
  return (
    <>
      <CreatorDashboardCards />
      <CreatorDashboardChart />
      <CreatorDashboardTable data={dashboardMockData} />
    </>
  );
}
