import type { JSX } from 'react';
import { Suspense } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { loadCreatorDashboardOverviewPage } from '@/features/course/server/loaders/platform-creator';
import { InstructorMetrics } from '@/features/dashboard/platform/creator/instructor-metrics';
import { InstructorMetricsSkeleton } from '@/features/dashboard/platform/creator/instructor-metrics-skeleton';
import { readForPage } from '@/server/auth/page-access';

const OVERVIEW_DESCRIPTION = 'Here is an overview of your direct-to-consumer courses and learner performance.';

async function CreatorOverview(): Promise<JSX.Element> {
  const { user, activeLearners, totalEarnings, totalSales } = await readForPage(() =>
    loadCreatorDashboardOverviewPage()
  );

  return (
    <>
      <div>
        <h2 className='text-2xl font-bold tracking-tight text-foreground'>Welcome back, {user.firstName}!</h2>
        <p className='text-sm text-muted-foreground'>{OVERVIEW_DESCRIPTION}</p>
      </div>

      <InstructorMetrics metrics={{ activeLearners, totalEarnings, totalSales }} />
    </>
  );
}

function CreatorOverviewSkeleton(): JSX.Element {
  return (
    <>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-72 max-w-full' shape='text' />
        <p className='text-sm text-muted-foreground'>{OVERVIEW_DESCRIPTION}</p>
      </div>

      <InstructorMetricsSkeleton />
    </>
  );
}

/** The shell and layout stream first; the greeting and metrics suspend together on one skeleton. */
export default function CreatorDashboardOverviewPage(): JSX.Element {
  return (
    <>
      <Suspense fallback={<CreatorOverviewSkeleton />}>
        <CreatorOverview />
      </Suspense>
    </>
  );
}
