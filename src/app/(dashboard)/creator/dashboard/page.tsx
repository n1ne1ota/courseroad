import type { JSX } from 'react';

import { loadCreatorDashboardOverviewPage } from '@/features/course/server/loaders/platform-creator';
import { InstructorMetrics } from '@/features/dashboard/platform/creator/instructor-metrics';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';
import { readForPage } from '@/server/auth/page-access';

export default async function CreatorDashboardOverviewPage(): Promise<JSX.Element> {
  const { user, activeLearners, totalEarnings, totalSales } = await readForPage(() =>
    loadCreatorDashboardOverviewPage()
  );

  return (
    <DashboardPlatformLayout role='creator' title='Dashboard Overview'>
      <div className='flex flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>Welcome back, {user.firstName}!</h2>
          <p className='text-sm text-muted-foreground'>
            Here is an overview of your direct-to-consumer courses and learner performance.
          </p>
        </div>

        <InstructorMetrics metrics={{ activeLearners, totalEarnings, totalSales }} />
      </div>
    </DashboardPlatformLayout>
  );
}
