'use client';

import { useState } from 'react';

import type { ChartConfig } from '@kurume-ui/core';

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@kurume-ui/core';
import { ToggleGroup, ToggleGroupItem } from '@kurume-ui/core';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@kurume-ui/core';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { type CreatorMetric, creatorMetricsData } from '@/features/dashboard/shared/data/chart-data';

const chartConfig = {
  enrollments: {
    color: 'hsl(var(--chart-5))',
    label: 'Enrollments'
  },
  revenue: {
    color: 'hsl(var(--chart-1))',
    label: 'Revenue'
  }
} satisfies ChartConfig;

export function CreatorDashboardChart() {
  const [timeRange, setTimeRange] = useState('30d');

  const filteredData = creatorMetricsData.filter((item: CreatorMetric) => {
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
          <CardTitle>Course Revenue & Growth</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>Total revenue vs new enrollments</span>
            <span className='@[540px]/card:hidden'>Revenue trends</span>
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
          <LineChart data={filteredData}>
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
            <YAxis
              tickFormatter={value =>
                new Intl.NumberFormat('en-US', {
                  currency: 'USD',
                  maximumFractionDigits: 0,
                  style: 'currency'
                }).format(value)
              }
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              yAxisId='left'
            />
            <YAxis axisLine={false} orientation='right' tickLine={false} tickMargin={8} yAxisId='right' />
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
            <Line
              activeDot={{ r: 6 }}
              dataKey='revenue'
              dot={false}
              stroke='var(--color-revenue)'
              strokeWidth={2}
              yAxisId='left'
            />
            <Line
              activeDot={{ r: 6 }}
              dataKey='enrollments'
              dot={false}
              stroke='var(--color-enrollments)'
              strokeWidth={2}
              yAxisId='right'
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
