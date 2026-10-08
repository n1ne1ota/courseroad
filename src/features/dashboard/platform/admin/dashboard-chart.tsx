'use client';

import { useState } from 'react';

import type { ChartConfig } from '@kurume-ui/core';

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@kurume-ui/core';
import { ToggleGroup, ToggleGroupItem } from '@kurume-ui/core';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@kurume-ui/core';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { type AdminMetric, adminMetricsData } from '@/features/dashboard/shared/data/chart-data';

const chartConfig = {
  signups: {
    color: 'hsl(var(--chart-2))',
    label: 'Signups'
  },
  visitors: {
    color: 'hsl(var(--chart-1))',
    label: 'Visitors'
  }
} satisfies ChartConfig;

export function AdminDashboardChart() {
  const [timeRange, setTimeRange] = useState('30d');

  const filteredData = adminMetricsData.filter((item: AdminMetric) => {
    const date = new Date(item.date);
    const referenceDate = new Date('2024-06-30');
    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className='@container/card'>
      <CardHeader className='border-b py-5'>
        <div className='grid gap-1'>
          <CardTitle>Total Visitors</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>Total for the last 3 months</span>
            <span className='@[540px]/card:hidden'>Last 3 months</span>
          </CardDescription>
        </div>
        <CardAction>
          <ToggleGroup className='flex' type='single' value={timeRange} variant='outline' onValueChange={setTimeRange}>
            <ToggleGroupItem className='h-9 px-4 sm:px-6' value='90d'>
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem className='h-9 px-4 sm:px-6' value='30d'>
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem className='h-9 px-4 sm:px-6' value='7d'>
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer className='aspect-auto h-[250px] w-full' config={chartConfig}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id='fillVisitors' x1='0' x2='0' y1='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-visitors)' stopOpacity={0.5} />
                <stop offset='95%' stopColor='var(--color-visitors)' stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id='fillSignups' x1='0' x2='0' y1='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-signups)' stopOpacity={0.5} />
                <stop offset='95%' stopColor='var(--color-signups)' stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='4 4' strokeOpacity={0.2} vertical={false} />
            <XAxis
              tickFormatter={value => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short'
                });
              }}
              axisLine={false}
              dataKey='date'
              minTickGap={32}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={value => {
                    return new Date(value as string | number | Date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short'
                    });
                  }}
                  indicator='dot'
                />
              }
              cursor={false}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area type='natural' dataKey='signups' fill='url(#fillSignups)' stackId='a' stroke='var(--color-signups)' />
            <Area
              type='natural'
              dataKey='visitors'
              fill='url(#fillVisitors)'
              stackId='a'
              stroke='var(--color-visitors)'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
