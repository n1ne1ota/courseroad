import { Activity, Fingerprint, History, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@courseroad/kurume-ui';

interface FingerprintStatsCardsProps {
  metrics: {
    active24h: number;
    active7d: number;
    averageDrift: number;
    totalDevices: number;
  };
}

export function FingerprintStatsCards({ metrics }: FingerprintStatsCardsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Tracked Devices</CardTitle>
          <Fingerprint className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{metrics.totalDevices.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>Unique device fingerprints</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Active (24h)</CardTitle>
          <Activity className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{metrics.active24h.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>Devices seen today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Active (7d)</CardTitle>
          <History className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{metrics.active7d.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>Devices seen this week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Avg. Pattern Drift</CardTitle>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{metrics.averageDrift.toFixed(2)} / 3</div>
          <p className='text-xs text-muted-foreground'>Average healed signals per match</p>
        </CardContent>
      </Card>
    </div>
  );
}
