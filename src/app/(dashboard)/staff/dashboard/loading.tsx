import type { JSX } from 'react';

import { DashboardBodySkeleton } from '@/features/dashboard/shared/shell/dashboard-shell-skeleton';

/** Segment-level boundary inside the staff dashboard layout: the sidebar and header are already mounted. */
export default function DashboardLoading(): JSX.Element {
  return <DashboardBodySkeleton />;
}
