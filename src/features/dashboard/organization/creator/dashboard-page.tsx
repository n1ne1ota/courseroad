import 'server-only';

import type { JSX } from 'react';

import { CreatorDashboardCards } from '@/features/dashboard/organization/creator/analytics-cards';
import { CreatorDashboardChart } from '@/features/dashboard/organization/creator/analytics-chart';
import { CreatorDashboardTable } from '@/features/dashboard/organization/creator/analytics-table';
import { dashboardMockData } from '@/features/dashboard/shared/data/dashboard-data';

export async function CreatorDashboardView(): Promise<JSX.Element> {
  return (
    <>
      <CreatorDashboardCards />
      <div className='px-4 lg:px-6'>
        <CreatorDashboardChart />
      </div>
      <CreatorDashboardTable data={dashboardMockData} />
    </>
  );
}
