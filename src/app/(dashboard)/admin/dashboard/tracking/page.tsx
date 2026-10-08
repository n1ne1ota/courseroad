import type { Metadata } from 'next';

import { FingerprintStatsCards } from '@/features/analytics/fingerprint-stats-cards';
import {
  getFingerprintMetrics,
  getRecentVisitors,
  getVisitorsOverTime
} from '@/features/analytics/server/tracking-analytics-service';
import { VisitorChart } from '@/features/analytics/visitor-chart';
import { VisitorHistoryTable } from '@/features/analytics/visitor-history-table';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

export const metadata: Metadata = {
  description: 'Device intelligence and fingerprinting telemetry.',
  title: 'Tracking Analytics | Admin'
};

/**
 * React Server Component that fetches the tracking data metrics
 * and assembles the Admin Tracking Dashboard layout.
 */
export default async function TrackingAdminPage() {
  // Fetch all required data in parallel on the server
  const [metrics, recentVisitors, chartData] = await Promise.all([
    getFingerprintMetrics(),
    getRecentVisitors(50),
    getVisitorsOverTime(30)
  ]);

  return (
    <DashboardPlatformLayout role='admin' title='Tracking Analytics'>
      <div className='flex-1 space-y-6 p-8 pt-6'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Device Intelligence</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Monitor browser fingerprinting signals, unique visitors, and algorithmic drift.
            </p>
          </div>
        </div>

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
      </div>
    </DashboardPlatformLayout>
  );
}
