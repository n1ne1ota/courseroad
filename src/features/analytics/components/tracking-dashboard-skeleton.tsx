import type { JSX } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@courseroad/kurume-ui';

import { Activity, Fingerprint, History, TrendingUp } from 'lucide-react';

const STAT_CARDS = [
  { description: 'Unique device fingerprints', Icon: Fingerprint, title: 'Total Tracked Devices' },
  { description: 'Devices seen today', Icon: Activity, title: 'Active (24h)' },
  { description: 'Devices seen this week', Icon: History, title: 'Active (7d)' },
  { description: 'Average healed signals per match', Icon: TrendingUp, title: 'Avg. Pattern Drift' }
] as const;

const TABLE_HEADERS = ['Visitor ID', 'Platform', 'IP Address', 'Last Match Score', 'Drift Count', 'Last Seen'] as const;

/**
 * Skeleton for the tracking data: stat cards, the visitor chart, and the telemetry ledger.
 * Titles and column headers are static in the real components, so they render here as real text.
 */
export function TrackingDashboardSkeleton({ rows = 6 }: { rows?: number }): JSX.Element {
  return (
    <div className='contents' aria-hidden='true'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {STAT_CARDS.map(({ description, Icon, title }) => (
          <Card key={title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{title}</CardTitle>
              <Icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <Skeleton className='mb-1 h-8 w-20' shape='text' />
              <p className='text-xs text-muted-foreground'>{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <div className='col-span-full'>
          <Card>
            <CardHeader>
              <CardTitle>Historical Activity</CardTitle>
              <CardDescription>Rolling counts of unique devices authenticated daily</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className='h-[350px] w-full' />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='mt-8'>
        <div className='mb-4'>
          <h3 className='text-xl font-semibold tracking-tight'>Recent Telemetry</h3>
          <p className='text-sm text-muted-foreground'>
            A continuous feed of the latest authenticated visitor signals.
          </p>
        </div>
        <div className='rounded-md border bg-card text-card-foreground shadow-sm'>
          <Table>
            <TableHeader>
              <TableRow>
                {TABLE_HEADERS.map(header => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
                <TableHead className='w-[80px]'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }, (_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className='h-4 w-20' shape='text' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-24' shape='text' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-28' shape='text' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-5 w-12 rounded-full' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-6' shape='text' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-24' shape='text' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-8 w-16' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
