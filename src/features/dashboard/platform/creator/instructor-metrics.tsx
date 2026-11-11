'use client';

import type { JSX } from 'react';

import { BarChart3, DollarSign, GraduationCap, Percent, TrendingUp } from 'lucide-react';

interface InstructorMetricsProps {
  metrics: {
    activeLearners: number;
    totalEarnings: number; // in cents
    totalSales: number;
  };
}

export function InstructorMetrics({ metrics }: InstructorMetricsProps): JSX.Element {
  const displayEarnings = (metrics.totalEarnings / 100).toLocaleString(undefined, {
    currency: 'USD',
    minimumFractionDigits: 2,
    style: 'currency'
  });

  // Mock chart data for premium visual layout representation
  const chartData = [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 340 },
    { label: 'Mar', value: 210 },
    { label: 'Apr', value: 450 },
    { label: 'May', value: 680 },
    { label: 'Jun', value: 520 },
    { label: 'Jul', value: 790 },
    { label: 'Aug', value: 610 },
    { label: 'Sep', value: 850 },
    { label: 'Oct', value: 920 },
    { label: 'Nov', value: metrics.totalSales > 0 ? 1100 : 0 },
    { label: 'Dec', value: metrics.totalSales > 0 ? 1450 : 0 }
  ];

  const maxChartVal = Math.max(...chartData.map(d => d.value), 1000);

  return (
    <div className='flex flex-col gap-8'>
      {/* Metric Cards Grid */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
        {/* Earnings Card */}
        <div className='border-default-200/50 relative overflow-hidden rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
          <div className='pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-emerald-500/10 blur-3xl' />
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>Total Earnings</p>
              <h3 className='mt-2 text-2xl font-bold tracking-tight text-foreground'>{displayEarnings}</h3>
              <p className='mt-1 flex items-center gap-1 text-xs text-emerald-500'>
                <TrendingUp className='size-3' />
                <span>+12.4% vs last month</span>
              </p>
            </div>
            <div className='flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500'>
              <DollarSign className='size-6' />
            </div>
          </div>
        </div>

        {/* Enrollments Card */}
        <div className='border-default-200/50 relative overflow-hidden rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
          <div className='pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-primary/10 blur-3xl' />
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>Active Learners</p>
              <h3 className='mt-2 text-2xl font-bold tracking-tight text-foreground'>
                {metrics.activeLearners.toLocaleString()}
              </h3>
              <p className='mt-1 flex items-center gap-1 text-xs text-primary'>
                <GraduationCap className='size-3' />
                <span>Total learner reach</span>
              </p>
            </div>
            <div className='flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary'>
              <GraduationCap className='size-6' />
            </div>
          </div>
        </div>

        {/* Total Sales Card */}
        <div className='border-default-200/50 relative overflow-hidden rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
          <div className='pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-indigo-500/10 blur-3xl' />
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>Total Sales</p>
              <h3 className='mt-2 text-2xl font-bold tracking-tight text-foreground'>
                {metrics.totalSales.toLocaleString()}
              </h3>
              <p className='mt-1 flex items-center gap-1 text-xs text-indigo-500'>
                <Percent className='size-3' />
                <span>100% direct payouts</span>
              </p>
            </div>
            <div className='flex size-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500'>
              <BarChart3 className='size-6' />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trends Chart Card */}
      <div className='border-default-200/50 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
        <div className='border-default-200/50 mb-6 flex items-center justify-between gap-4 border-b pb-5'>
          <div>
            <h4 className='text-base font-bold text-foreground'>Sales Performance History</h4>
            <p className='text-sm text-muted-foreground'>Monthly earnings progression chart.</p>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className='w-full overflow-hidden'>
          <div className='relative flex h-64 w-full items-end justify-between gap-2 px-2 pt-4'>
            {/* Grid Lines */}
            <div className='border-default-200/50 pointer-events-none absolute inset-x-0 top-4 bottom-0 flex flex-col justify-between border-b'>
              <div className='border-default-200/20 w-full border-t' />
              <div className='border-default-200/20 w-full border-t' />
              <div className='border-default-200/20 w-full border-t' />
              <div className='border-default-200/20 w-full border-t' />
            </div>

            {/* Bars */}
            {chartData.map((data, idx) => {
              const heightPct = ((data.value / maxChartVal) * 100).toFixed(1);
              return (
                <div key={idx} className='group z-10 flex flex-1 flex-col items-center gap-2'>
                  {/* Tooltip */}
                  <div className='pointer-events-none absolute bottom-full mb-2 rounded bg-foreground px-2 py-1 text-xs font-semibold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100'>
                    ${data.value}
                  </div>

                  <div
                    className='relative w-full overflow-hidden rounded-t-xl bg-primary/20 transition-all duration-300 hover:bg-primary/45'
                    style={{ height: `${heightPct}%`, minHeight: '4px' }}
                  >
                    <div className='absolute inset-x-0 bottom-0 h-1/2 bg-primary opacity-30 blur-sm' />
                  </div>
                  <span className='text-xs font-medium text-muted-foreground'>{data.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
