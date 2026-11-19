'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface VisitorChartProps {
  data: {
    count: number;
    date: string;
  }[];
}

export function VisitorChart({ data }: VisitorChartProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Activity</CardTitle>
          <CardDescription>Daily unique visitors</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[350px] items-center justify-center'>
          <p className='text-sm text-muted-foreground'>No tracking data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Activity</CardTitle>
        <CardDescription>Rolling counts of unique devices authenticated daily</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-[350px] w-full'>
          <ResponsiveContainer height='100%' width='100%'>
            <AreaChart data={data} margin={{ bottom: 0, left: -20, right: 10, top: 10 }}>
              <defs>
                <linearGradient id='visitorGradient' x1='0' x2='0' y1='0' y2='1'>
                  <stop offset='5%' stopColor='var(--kurume-typography)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='var(--kurume-typography)' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis
                tickFormatter={value => {
                  // Parse "YYYY-MM-DD" back to "MM/DD"
                  const [, month, day] = value.split('-');
                  return `${month}/${day}`;
                }}
                axisLine={false}
                dataKey='date'
                fontSize={12}
                tickLine={false}
              />
              <YAxis axisLine={false} fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--kurume-surface-0)',
                  border: '1px solid var(--kurume-border-1)',
                  borderRadius: '8px'
                }}
                labelFormatter={label => `Date: ${label}`}
              />
              <Area
                type='monotone'
                dataKey='count'
                fill='url(#visitorGradient)'
                stroke='var(--kurume-typography)'
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
