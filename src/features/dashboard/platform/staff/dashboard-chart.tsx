'use client';

import { useState } from 'react';

import type { ChartConfig } from '@kurume-ui/core';

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@kurume-ui/core';
import { ToggleGroup, ToggleGroupItem } from '@kurume-ui/core';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@kurume-ui/core';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { type StaffMetric, staffMetricsData } from '@/features/dashboard/shared/data/chart-data';

const chartConfig = {
  approved: {
    color: 'hsl(var(--chart-2))',
    label: 'Approved'
  },
  pending: {
    color: 'hsl(var(--chart-3))',
    label: 'Pending'
  },
  rejected: {
    color: 'hsl(var(--chart-5))',
    label: 'Rejected'
  }
} satisfies ChartConfig;

export function StaffDashboardChart() {
  const [timeRange, setTimeRange] = useState('30d');

  const filteredData = staffMetricsData.filter((item: StaffMetric) => {
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
          <CardTitle>Content Moderation Activity</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>Total reviews for the last 3 months</span>
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
          <BarChart data={filteredData}>
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
            <Bar dataKey='approved' fill='var(--color-approved)' radius={[0, 0, 0, 0]} stackId='a' />
            <Bar dataKey='pending' fill='var(--color-pending)' radius={[0, 0, 0, 0]} stackId='a' />
            <Bar dataKey='rejected' fill='var(--color-rejected)' radius={[4, 4, 0, 0]} stackId='a' />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
