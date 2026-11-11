import type { JSX } from 'react';

import { CreatorDashboardChart } from '@/features/dashboard/organization/creator/analytics-chart';

export function AnalyticsView(): JSX.Element {
  return (
    <div className='flex-1 space-y-6 p-8 pt-6'>
      <div className='flex items-center justify-between space-y-2'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Revenue Analytics</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Detailed breakdown of your course earnings and learner enrollments.
          </p>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <div className='col-span-full'>
          <CreatorDashboardChart />
        </div>
      </div>
    </div>
  );
}
