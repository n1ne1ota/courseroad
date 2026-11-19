import { Suspense } from 'react';

import type { Metadata } from 'next';

import { FingerprintStatsCards } from '@/features/analytics/components/fingerprint-stats-cards';
import { TrackingDashboardSkeleton } from '@/features/analytics/components/tracking-dashboard-skeleton';
import { VisitorChart } from '@/features/analytics/components/visitor-chart';
import { VisitorHistoryTable } from '@/features/analytics/components/visitor-history-table';
import {
  getFingerprintMetrics,
  getRecentVisitors,
  getVisitorsOverTime
} from '@/features/analytics/server/tracking-analytics-service';

export const metadata: Metadata = {
  description: 'Device intelligence and fingerprinting telemetry.',
  title: 'Tracking Analytics | Admin'
};

/** Fetches the tracking data metrics in parallel and renders the stats, chart, and telemetry ledger. */
async function TrackingContent() {
  const [metrics, recentVisitors, chartData] = await Promise.all([
    getFingerprintMetrics(),
    getRecentVisitors(50),
    getVisitorsOverTime(30)
  ]);

  return (
    <>
      {/* Topline Metrics */}
      <FingerprintStatsCards metrics={metrics} />

      {/* Time Series Visualization */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <div className='col-span-full'>
          <VisitorChart data={chartData} />
        </div>
      </div>

      {/* Deep-Dive Ledger */}
      <div className='mt-8'>
        <div className='mb-4'>
          <h3 className='text-xl font-semibold tracking-tight'>Recent Telemetry</h3>
          <p className='text-sm text-muted-foreground'>
            A continuous feed of the latest authenticated visitor signals.
          </p>
        </div>
        <VisitorHistoryTable visitors={recentVisitors} />
      </div>
    </>
  );
}

/** The heading is static and streams first; the data-driven sections suspend behind a matching skeleton. */
export default function TrackingAdminPage() {
  return (
    <>
      <div className='flex items-center justify-between space-y-2'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Device Intelligence</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Monitor browser fingerprinting signals, unique visitors, and algorithmic drift.
          </p>
        </div>
      </div>

      <Suspense fallback={<TrackingDashboardSkeleton />}>
        <TrackingContent />
      </Suspense>
    </>
  );
}
