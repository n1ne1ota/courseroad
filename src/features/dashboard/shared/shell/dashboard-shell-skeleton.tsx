import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';
import { DashboardLayoutSkeleton } from '@courseroad/kurume-ui/dashboard';

import { dashboardPageClass } from '../ui/dashboard-page-shell';

/**
 * Neutral page body for a route whose content isn't known yet: a heading, a description line, and a panel.
 * Use it as a segment `loading.tsx`, where the segment layout already provides the sidebar and header.
 */
export function DashboardBodySkeleton(): JSX.Element {
  return (
    <>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-9 w-56' shape='text' />
        <Skeleton className='h-5 w-80 max-w-full' shape='text' />
      </div>
      <Skeleton className='h-72 w-full rounded-md' />
    </>
  );
}

/**
 * Fallback for guard layouts, where neither the shell nor the page behind it has rendered yet.
 * It keeps the real dashboard geometry (sidebar, header, page container) around a neutral body;
 * pages with known content use their own section skeletons instead.
 */
export function DashboardShellSkeleton(): JSX.Element {
  return (
    <DashboardLayoutSkeleton>
      <div className={dashboardPageClass}>
        <DashboardBodySkeleton />
      </div>
    </DashboardLayoutSkeleton>
  );
}
